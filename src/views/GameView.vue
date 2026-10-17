<!-- src/views/GameView.vue -->
<template>
  <section v-if="game.screen === 'game' && game.round">
    <p>Turn: <strong>{{ game.currentPlayerName }}</strong></p>
    <p>Color: <strong>{{ game.currentColor }}</strong></p>

    <div class="table">
      <div>
        <h2>Upper card</h2>
        <Card :card="game.topCard"/>
      </div>

      <div>
        <h2>Bots hands</h2>
        <p v-for="bot in game.bots" :key="bot.name">
          {{ bot.name }}: {{ bot.cardCount }} cards
        </p>
      </div>
    </div>

    <!-- Dumb presentation component handling human controls -->
    <PlayerHand
        v-if="isHumanTurn"
        :can-play="(index) => game.round.canPlay(index)"
        :can-play-any="game.round.canPlayAny()"
        :colors="colors"
        :hand="game.myHand"
        :pending-wild-index="pendingWildIndex"
        @say-uno="game.sayUno()"
        @select-card="selectCard"
        @play-wild="playWild"
        @draw-card="handleDrawCard"
    />

    <div v-else class="bot-turn">
      <p>Waiting for bot to play...</p>
    </div>
  </section>

  <section v-else-if="game.screen === 'result'">
    <h2>Round ended</h2>
    <p>Winner: <strong>{{ game.winnerName }}</strong></p>
    <button @click="playAgain">Play Again</button>
  </section>
</template>

<script>
import {useGameStore} from '../stores/useGameStore.ts'
import Card from '../components/Card.vue'
import PlayerHand from '../components/PlayerHand.vue'

export default {
  name: 'GameView',
  components: {Card, PlayerHand},
  data() {
    return {
      game: useGameStore(),
      worker: null,
      pendingWildIndex: null,
      colors: ['BLUE', 'RED', 'GREEN', 'YELLOW']
    }
  },
  computed: {
    isHumanTurn() {
      return this.game.currentPlayer === 0
    }
  },
  mounted() {
    this.worker = new Worker('/bot.worker.js')
    this.worker.onmessage = ({data}) => {
      this.handleBotMessage(data)
    }

    if (!this.game.round) {
      this.$router.push('/')
    } else {
      this.runBotTurn()
    }
  },
  beforeUnmount() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  },
  methods: {
    selectCard(index) {
      if (!this.game.round || this.game.currentPlayer !== 0 || !this.game.round.canPlay(index)) return

      const card = this.game.round.playerHand(0)[index]
      if (card.type === 'WILD' || card.type === 'WILD DRAW') {
        this.pendingWildIndex = index
        return
      }

      this.game.playHumanCard(index)
      this.runBotTurn()
    },

    playWild(color) {
      if (this.pendingWildIndex === null) return
      const index = this.pendingWildIndex
      this.pendingWildIndex = null
      this.game.playHumanCard(index, color)
      this.runBotTurn()
    },

    handleDrawCard() {
      this.game.drawCard()
      if (this.game.currentPlayer !== 0) {
        this.runBotTurn()
      }
    },

    runBotTurn() {
      if (this.game.screen !== 'game' || !this.game.round) return

      const playerIndex = this.game.currentPlayer
      if (playerIndex === undefined || playerIndex === 0) return

      const hand = this.game.round.playerHand(playerIndex)
      const legalIndices = hand.map((_, index) => index).filter(index => this.game.round.canPlay(index))

      if (legalIndices.length === 0) {
        this.game.round.draw()
        this.game.updateTrigger++
        this.game.checkGameStatus()
        window.setTimeout(() => this.runBotTurn(), 300)
        return
      }

      if (this.worker) {
        this.worker.postMessage({
          hand: hand.map(card => ({...card})),
          legalIndices
        })
      }
    },

    handleBotMessage(data) {
      if (this.game.screen !== 'game' || !this.game.round) return

      const playerIndex = this.game.currentPlayer
      if (playerIndex === undefined || playerIndex === 0) return

      if (data.action === 'draw') {
        this.game.round.draw()
        this.game.updateTrigger++
        this.game.checkGameStatus()
        window.setTimeout(() => this.runBotTurn(), 300)
        return
      }

      try {
        const hand = this.game.round.playerHand(playerIndex)
        if (hand.length === 2) {
          this.game.round.sayUno(playerIndex)
        }

        this.game.round.play(data.index, data.color)
        this.game.updateTrigger++
        this.game.checkGameStatus()
        window.setTimeout(() => this.runBotTurn(), 300)
      } catch (error) {
        console.error(error)
        this.game.updateTrigger++
        this.game.checkGameStatus()
      }
    },

    playAgain() {
      this.game.screen = 'setup'
      this.$router.push('/')
    }
  }
}
</script>