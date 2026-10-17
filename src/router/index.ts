import {createRouter, createWebHistory} from 'vue-router'
import SetupView from '../views/SetupView.vue'
import GameView from '../views/GameView.vue'

const routes = [
    {path: '/', name: 'setup', component: SetupView},
    {path: '/game', name: 'game', component: GameView},
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})