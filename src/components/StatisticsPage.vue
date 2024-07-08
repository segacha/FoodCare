<template>
    <header>
      <nav class="navbar">
        <div class="logo">
          <a href="#">
            FoodCare
          </a>
        </div>
        <ul class="menu">
          <li><router-link to="/login">Login</router-link></li>
          <li><router-link to="/home">Home</router-link></li>
          <li><router-link to="/shopping-list">Shop List</router-link></li>
          <li><router-link to="/statistics">Statistics</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
        </ul>
        <div class="buttons">
          <input type="button" value="LogOut" @click="navigateToLogout"/>
        </div>
      </nav>
      <div class="content">
        <h2>Monthly Expenses</h2>
        <canvas id="expensesChart"></canvas>
      </div>
    </header>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { store } from '../store';
  import { useRouter } from 'vue-router';
  import { Chart } from 'chart.js'; // Stellen Sie sicher, dass dieser Import vorhanden ist
  
  export default {
    name: 'StatisticsPage',
    setup() {
      const user = ref(store.user || JSON.parse(localStorage.getItem('user')));
      const expensesChart = ref(null);
      const router = useRouter();
  
      const fetchMonthlyExpenses = async () => {
        if (!user.value || !user.value._id) {
          console.error('User ID is undefined');
          return;
        }
  
        try {
          const response = await axios.get(`http://localhost:3000/api/user/${user.value._id}/monthly-expenses`);
          const expensesData = response.data;
          renderChart(expensesData);
        } catch (error) {
          console.error('Error fetching monthly expenses:', error);
        }
      };
  
      const renderChart = (expensesData) => {
        const ctx = document.getElementById('expensesChart').getContext('2d');
        expensesChart.value = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [{
              label: 'Monthly Expenses',
              data: expensesData,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      };
  
      const navigateToLogout = () => {
        store.setUser(null); // Limpiar el usuario en el almacén
        localStorage.removeItem('user'); // Remover usuario de localStorage
        router.push('/'); // Navegar a la página de bienvenida
      };
  
      onMounted(() => {
        if (user.value) {
          fetchMonthlyExpenses();
        }
      });
  
      return {
        navigateToLogout
      };
    }
  };
  </script>
  
  <style scoped>
  /* Deine Stile hier */
  </style>
  