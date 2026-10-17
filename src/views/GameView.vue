<!-- src/views/GameView.vue -->
<template>
  <section v-if="game.round">
    <p>Turn: <strong>{{ game.currentPlayerName }}</strong></p>
    <p>Color: <strong>{{ game.currentColor }}</strong></p>

    <div class="table">
      <div>
        <h2>Upper card</h2>
        <Card :card="game.topCard"/>
      </div>

      <div>
        <h2>Bots hands</h2>
        <CardCountDisplay
            v-for="bot in game.bots"
            :key="bot.name"
            :can-catch="game.round.hasMissedUno(bot.index)"
            :card-count="bot.cardCount"
            :player-name="bot.name"
            @catch-uno="catchBot(bot.index)"
        />
      </div>
    </div>

    <PlayerHand
        v-if="isHumanTurn"
        :can-play="(index) => game.round.canPlay(index)"
        :can-play-any="game.round.canPlayAny()"
        :colors="colors"
        :hand="game.myHand"
        :has-said-uno="game.hasUserSaidUno"
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
</template>

<script>
import {useGameStore} from '../stores/useGameStore.ts'
import Card from '../components/Card.vue'
import PlayerHand from '../components/PlayerHand.vue'
import CardCountDisplay from '../components/CardCountDisplay.vue'

export default {
  name: 'GameView',
  components: {Card, PlayerHand, CardCountDisplay},
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
      this.checkAndRedirect()
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
    checkAndRedirect() {
      if (this.game.hasEnded) {
        this.$router.push('/result')
      }
    },

    selectCard(index) {
      if (!this.game.round || this.game.currentPlayer !== 0 || !this.game.round.canPlay(index)) return

      const card = this.game.round.playerHand(0)[index]
      if (card.type === 'WILD' || card.type === 'WILD DRAW') {
        this.pendingWildIndex = index
        return
      }

      this.game.playHumanCard(index)
      this.checkAndRedirect()
      this.runBotTurn()
    },

    playWild(color) {
      if (this.pendingWildIndex === null) return
      const index = this.pendingWildIndex
      this.pendingWildIndex = null
      this.game.playHumanCard(index, color)
      this.checkAndRedirect()
      this.runBotTurn()
    },

    handleDrawCard() {
      this.game.drawCard()
      this.checkAndRedirect()
      if (this.game.currentPlayer !== 0) {
        this.runBotTurn()
      }
    },

    runBotTurn() {
      if (!this.game.round || this.game.hasEnded) return

      const playerIndex = this.game.currentPlayer
      if (playerIndex === undefined || playerIndex === 0) return

      const accusedIndex = Array.from({length: this.game.round.playerCount}, (_, i) => i)
          .find(i => i !== playerIndex && this.game.round.hasMissedUno(i));

      const hand = this.game.round.playerHand(playerIndex)
      const legalIndices = hand.map((_, index) => index).filter(index => this.game.round.canPlay(index))

      if (this.worker) {
        this.worker.postMessage({
          hand: hand.map(card => ({...card})),
          legalIndices,
          accusedIndex
        })
      }
    },

    catchBot(accusedIndex) {
      if (!this.game.round) return
      const success = this.game.round.catchUnoFailure({accuser: 0, accused: accusedIndex})
      if (success) {
        this.game.updateTrigger++
      }
    },

    handleBotMessage(data) {
      if (!this.game.round || this.game.hasEnded) return

      const playerIndex = this.game.currentPlayer
      if (playerIndex === undefined || playerIndex === 0) return

      if (data.action === 'catch') {
        this.game.round.catchUnoFailure({accuser: playerIndex, accused: data.accusedIndex})
        this.game.updateTrigger++
        this.checkAndRedirect()
        window.setTimeout(() => this.runBotTurn(), 300)
        return
      }

      if (data.action === 'draw') {
        this.game.round.draw()
        this.game.updateTrigger++
        this.checkAndRedirect()
        window.setTimeout(() => this.runBotTurn(), 300)
        return
      }

      try {
        if (data.sayUno) {
          this.game.round.sayUno(playerIndex)
        }

        this.game.round.play(data.index, data.color)
        this.game.updateTrigger++
        this.checkAndRedirect()
        window.setTimeout(() => this.runBotTurn(), 300)
      } catch (error) {
        console.error(error)
        this.game.updateTrigger++
        this.checkAndRedirect()
      }
    },
  }
}
</script>