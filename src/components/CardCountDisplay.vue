<template>
  <div class="card-count-display">
    <span class="player-name">{{ playerName }}</span>:
    <span class="count-badge">{{ cardCount }} cards</span>

    <button v-if="canCatch" class="catch-button" @click="$emit('catch-uno')">
      Catch UNO!
    </button>
  </div>
</template>

<script>
export default {
  name: 'CardCountDisplay',
  props: {
    playerName: {type: String, required: true},
    cardCount: {type: Number, required: true},
    canCatch: {type: Boolean, default: false}
  }
}
</script>

<style scoped>
.card-count-display {
  font-size: 1rem;
  margin: 6px 0;
}

.player-name {
  font-weight: bold;
}

.catch-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
}

.catch-button:hover {
  background: #c0392b;
}
</style>