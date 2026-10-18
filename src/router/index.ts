import {createRouter, createWebHistory} from 'vue-router'
import SetupView from '../views/SetupView.vue'
import GameView from '../views/GameView.vue'
import ResultView from '../views/ResultView.vue'
import RegisterView from "../views/RegisterView.vue";
import LoginView from "../views/LoginView.vue";

const routes = [
    {path: '/', name: 'setup', component: SetupView},
    {path: '/game', name: 'game', component: GameView},
    {path: '/result', name: 'result', component: ResultView},
    {path: '/register', name: 'register', component: RegisterView},
    {path: '/login', name: 'login', component: LoginView},
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})