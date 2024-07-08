import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import LoginPage from '../components/LoginPage.vue';
import WelcomePage from '../components/Welcome_Page.vue';
import ShoppingPage from '../components/ShoppingPage.vue';
import ChartPage from '../components/ChartPage.vue';

const routes = [
  { path: '/', component: WelcomePage },
  { path: '/login', component: LoginPage },
  { path: '/home', component: HomePage },
  { path: '/shopping-list', component: ShoppingPage },
  { path: '/chart', component: ChartPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;


