<template>
  <main class="app">
    <AuthHeader/>
    <h1>UNO</h1>
    <RouterView/>
  </main>
</template>

<script>
import AuthHeader from './components/AuthHeader.vue'

export default {
  name: 'App',
  components: {
    AuthHeader
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>