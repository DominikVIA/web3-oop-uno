<template>
  <section class="panel">
    <h2>Round ended</h2>
    <p>Winner: <strong>{{ game.winnerName }}</strong></p>
    <button @click="playAgain">Play Again</button>
  </section>
</template>

<script>
import {useGameStore} from '../stores/useGameStore.ts'

export default {
  name: 'ResultView',
  data() {
    return {
      game: useGameStore()
    }
  },
  mounted() {
    if (!this.game.round || !this.game.hasEnded) {
      this.$router.push('/')
    }
  },
  methods: {
    playAgain() {
      this.$router.push('/')
    }
  }
}
</script>