import {createRouter, createWebHistory} from 'vue-router'
import SetupView from '../views/SetupView.vue'
import GameView from '../views/GameView.vue'
import ResultView from '../views/ResultView.vue'

const routes = [
    {path: '/', name: 'setup', component: SetupView},
    {path: '/game', name: 'game', component: GameView},
    {path: '/result', name: 'result', component: ResultView}
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})