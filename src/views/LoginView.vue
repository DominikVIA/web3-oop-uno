<template>
  <section class="panel">
    <h2>Login to UNO</h2>
    <form @submit.prevent="handleLogin">
      <div class="field">
        <input v-model="username" placeholder="Username" required/>
      </div>
      <div class="field">
        <input v-model="password" placeholder="Password" required type="password"/>
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p>Don't have an account?
      <router-link to="/register">Register here</router-link>
    </p>
  </section>
</template>

<script>
import {useAuthStore} from '../stores/useAuthStore'

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      auth: useAuthStore()
    }
  },
  methods: {
    async handleLogin() {
      try {
        this.errorMessage = ''
        await this.auth.login(this.username, this.password)
        this.$router.push('/setup')
      } catch (error) {
        this.errorMessage = error.message
      }
    }
  }
}
</script>

<style scoped>
.panel {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.field {
  margin-bottom: 15px;
}

.error {
  color: red;
}
</style>