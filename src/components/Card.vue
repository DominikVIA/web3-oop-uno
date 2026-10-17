<!-- src/components/Card.vue -->
<template>
  <button
      :class="cardColorClass"
      :disabled="disabled"
      class="card"
      @click="$emit('click')">
    {{ formattedText }}
  </button>
</template>

<script>
export default {
  name: 'Card',
  props: {
    card: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    formattedText() {
      const c = this.card
      if (!c) return 'Sin carta'
      if (c.type === 'NUMBERED') return `${c.color} ${c.number}`
      if (c.type === 'WILD' || c.type === 'WILD DRAW') return c.type
      return `${c.color} ${c.type}`
    },
    cardColorClass() {
      return this.card.color ? this.card.color.toLowerCase() : 'wild'
    }
  }
}
</script>

<style scoped>
.card {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  display: inline-block;
  cursor: pointer;
  font-weight: bold;
  font-family: inherit;
}

.card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.blue {
  background: #3498db;
  color: white;
}

.red {
  background: #e74c3c;
  color: white;
}

.green {
  background: #2ecc71;
  color: white;
}

.yellow {
  background: #f1c40f;
  color: #2c3e50;
}

.wild {
  background: #2c3e50;
  color: white;
}
</style>