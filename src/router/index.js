import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomePage.vue'
import Login from '../components/LoginPage.vue'

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
