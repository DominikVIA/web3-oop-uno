<template>
  <div class="color-picker">
    <p>Select a color for the wild card:</p>
    <button
        v-for="color in colors"
        :key="color"
        :class="color.toLowerCase()"
        class="color-btn"
        @click="$emit('select-color', color)">
      {{ color }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  props: {
    colors: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.color-picker {
  margin: 15px 0;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 6px;
}

.color-btn {
  margin: 0 5px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
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
</style>