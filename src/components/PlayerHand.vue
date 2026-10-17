<template>
  <div class="human-turn">
    <h2>Your hand</h2>

    <p v-if="hand.length === 2" class="uno-message">
      You have 2 cards left! Say "UNO" before playing a card when you have two cards left
    </p>

    <button
        v-if="hand.length === 2"
        :disabled="hasSaidUno"
        class="uno-button"
        @click="$emit('say-uno')">
      {{ hasSaidUno ? 'UNO Called!' : 'Say UNO!' }}
    </button>

    <div class="hand">
      <Card
          v-for="(card, index) in hand"
          :key="index"
          :card="card"
          :disabled="!canPlay(index)"
          @click="$emit('select-card', index)"
      />
    </div>

    <ColorPicker
        v-if="pendingWildIndex !== null"
        :colors="colors"
        @select-color="(color) => $emit('play-wild', color)"
    />

    <button :disabled="canPlayAny" @click="$emit('draw-card')">
      Draw Card
    </button>
  </div>
</template>

<script>
import Card from './Card.vue'
import ColorPicker from './ColorPicker.vue'

export default {
  name: 'PlayerHand',
  components: {Card, ColorPicker},
  props: {
    hand: {type: Array, required: true},
    canPlay: {type: Function, required: true},
    canPlayAny: {type: Boolean, required: true},
    pendingWildIndex: {type: Number, default: null},
    colors: {type: Array, required: true},
    hasSaidUno: {type: Boolean, default: false} // <-- New prop
  }
}
</script>