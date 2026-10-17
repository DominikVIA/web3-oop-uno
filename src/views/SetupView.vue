<template>
  <section class="panel">
    <h2>Setup game</h2>

    <label for="bot-count">Number of bots:</label>
    <select id="bot-count" v-model.number="game.botCount">
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
      game: useGameStore()
    }
  },
  methods: {
    start() {
      this.game.startGame()
      this.$router.push('/game')
    }
  }
}
</script>