<!-- src/views/SetupView.vue -->
<template>
  <section class="panel">
    <h2>Setup game</h2>

    <label for="bot-count">Number of bots:</label>
    <select id="bot-count" v-model.number="botCount">
      <option :value="1">1 bot</option>
      <option :value="2">2 bots</option>
      <option :value="3">3 bots</option>
    </select>

    <button @click="start">Start Game</button>
  </section>
</template>

<script>
import {useGameStore} from '../stores/useGameStore.ts'

export default {
  name: 'SetupView',
  data() {
    return {
      botCount: 1, // Local state!
      game: useGameStore()
    }
  },
  methods: {
    start() {
      this.game.startGame(this.botCount)
      this.$router.push('/game')
    }
  }
}
</script>