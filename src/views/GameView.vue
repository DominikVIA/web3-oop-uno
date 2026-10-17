<template>
  <section v-if="game.screen === 'game' && game.view">
    <p>
      Turn: <strong>{{ game.view.currentPlayerName }}</strong>
    </p>

    <p>
      Color: <strong>{{ game.view.currentColor }}</strong>
    </p>

    <div class="table">
      <div>
        <h2>Upper card</h2>
        <div class="card top-card"> {{ game.formatCard(game.view.topCard) }}</div>
      </div>

      <div>
        <h2>Bots hands</h2>
        <p v-for="bot in game.view.bots" :key="bot.name">
          {{ bot.name }}: {{ bot.cardCount }} cards
        </p>
      </div>
    </div>

    <div v-if="isHumanTurn" class="human-turn">
      <h2>Your hand</h2>
      <p v-if="game.view.myHand.length === 2" class="uno-message">
        You have 2 cards left! Say "UNO" before playing a card when you have two cards left
      </p>

      <button v-if="game.view.myHand.length === 2" class="uno-button" @click="game.sayUno()">
        Say UNO!
      </button>

      <div class="hand">
        <button
            v-for="(card, index) in game.view.myHand"
            :key="index"
            :disabled="!game.round.canPlay(index)"
            @click="game.selectCard(index)">
          {{ game.formatCard(card) }}
        </button>
      </div>

      <div v-if="game.pendingWildIndex !== null">
        <p>Select a color for the wild card:</p>
        <button
            v-for="color in game.colors"
            :key="color"
            @click="game.playWild(color)">
          {{ color }}
        </button>
      </div>

      <button :disabled="game.round.canPlayAny()" @click="game.drawCard()">
        Draw Card
      </button>
    </div>

    <div v-else class="bot-turn">
      <p>Waiting for bot to play...</p>
    </div>
  </section>

  <section v-else-if="game.screen === 'result'">
    <h2>Round ended</h2>
    <p>
      Winner: <strong>{{ game.view.winnerName }}</strong>
    </p>
    <button @click="playAgain">Play Again</button>
  </section>
</template>

<script>
import {useGameStore} from '../stores/useGameStore.ts'

export default {
  name: 'GameView',
  data() {
    return {
      game: useGameStore()
    }
  },
  computed: {
    isHumanTurn() {
      return this.game.view && this.game.view.currentPlayer === 0
    }
  },
  mounted() {
    this.game.initWorker()
    this.game.worker.onmessage = ({data}) => {
      this.game.handleBotMessage(data)
    }

    // If user refreshes directly on /game without starting
    if (!this.game.round) {
      this.$router.push('/')
    } else {
      this.game.runBotTurn()
    }
  },
  beforeUnmount() {
    this.game.terminateWorker()
  },
  methods: {
    playAgain() {
      this.game.screen = 'setup'
      this.$router.push('/')
    }
  }
}
</script>