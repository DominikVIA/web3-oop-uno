<template>
  <header class="auth-header">
    <div v-if="auth.isAuthenticated" class="user-info">
      <span>Logged in as: <strong>{{ username }}</strong></span>
      <button class="btn-logout" @click="handleLogout">Logout</button>
    </div>

    <div v-else class="auth-buttons">
      <router-link to="/login">
        <button class="btn-login">Login</button>
      </router-link>
      <router-link to="/register">
        <button class="btn-register">Register</button>
      </router-link>
    </div>
  </header>
</template>

<script>
import {useAuthStore} from '../stores/useAuthStore'

export default {
  name: 'AuthHeader',
  data() {
    return {
      auth: useAuthStore()
    }
  },
  computed: {
    username() {
      return this.auth.currentUser?.username || 'Player'
    }
  },
  methods: {
    handleLogout() {
      this.auth.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.auth-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.user-info, .auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

button {
  padding: 6px 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.btn-login {
  background-color: #42b983;
  color: white;
}

.btn-register {
  background-color: #2c3e50;
  color: white;
}

.btn-logout {
  background-color: #e74c3c;
  color: white;
}
</style>