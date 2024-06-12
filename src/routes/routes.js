import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import LoginPage from '../components/LoginPage.vue';
import WelcomePage from '../components/Welcome_Page.vue';

const routes = [
  { path: '/', component: WelcomePage },
  { path: '/login', component: LoginPage },
  { path: '/home', component: HomePage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
