import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import LoginPage from '../components/LoginPage.vue';
import WelcomePage from '../components/Welcome_Page.vue';
import ShoppingPage from '../components/ShoppingPage.vue';
import StatisticsPage from '../components/StatisticsPage.vue';

const routes = [
  { path: '/', component: WelcomePage }, 
  { path: '/login', component: LoginPage },
  { path: '/home', component: HomePage },
  { path: '/statistics', component: StatisticsPage },
  { path: '/shopping-list', component: ShoppingPage,}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

