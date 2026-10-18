import {defineStore} from 'pinia'
import {apolloClient} from '../utils/apolloClient'
import {gql} from '@apollo/client/core'

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('uno_token') || null,
        currentUser: null as any | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async login(username: string, password: string) {
            const response = await apolloClient.mutate({
                mutation: LOGIN_MUTATION,
                variables: {username, password}
            })
            // Cast response.data to any to satisfy TypeScript strict checking
            const data = (response.data as any).login
            this.token = data.token
            this.currentUser = data.user
            localStorage.setItem('uno_token', data.token)
        },

        async register(username: string, password: string) {
            const response = await apolloClient.mutate({
                mutation: REGISTER_MUTATION,
                variables: {username, password}
            })
            // Cast response.data to any to satisfy TypeScript strict checking
            const data = (response.data as any).register
            this.token = data.token
            this.currentUser = data.user
            localStorage.setItem('uno_token', data.token)
        },

        logout() {
            this.token = null
            this.currentUser = null
            localStorage.removeItem('uno_token')
        }
    }
})