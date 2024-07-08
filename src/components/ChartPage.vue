<template>
    <body>
      <header>
        <nav class="navbar">
          <div class="logo">
            <img src="../assets/logo.png" alt="Logo">
            <a href="#">FoodCare</a>
          </div>
          <ul class="menu">
            <li><router-link to="/home">Home</router-link></li>
            <li><router-link to="/shopping-list">Shop List</router-link></li>
            <li><router-link to="/chart">Chart</router-link></li>
          </ul>
          <div class="buttons">
            <input type="button" value="LogOut" @click="navigateToLogout" />
          </div>
        </nav>
        <div class="content">
          <h2>Total Prices Per Month</h2>
          <canvas id="priceChart"></canvas>
        </div>
      </header>
    </body>
</template>
  
<script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { store } from '../store';
  import { useRouter } from 'vue-router';
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'ChartPage',
    setup() {
      const user = ref(store.user || JSON.parse(localStorage.getItem('user')));
      const router = useRouter();
  
      const fetchChartData = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/user/${user.value._id}/monthly-totals`);
          const chartData = response.data;
          renderChart(chartData);
        } catch (error) {
          console.error('Error fetching chart data:', error);
        }
      };
  
      const renderChart = (data) => {
        const ctx = document.getElementById('priceChart').getContext('2d');
        const labels = getMonthLabels();
        const values = data;
  
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Total Prices',
              data: values,
              backgroundColor: 'rgba(168, 45, 45, 1)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              }
            }
          }
        });
      };
  
      const getMonthLabels = () => {
        return [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
      };
  
      const navigateToLogout = () => {
        store.setUser(null);
        localStorage.removeItem('user');
        router.push('/');
      };
  
      onMounted(() => {
        if (user.value) {
          fetchChartData();
        }
      });
  
      return {
        user,
        navigateToLogout
      };
    }
  };
</script>
  
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rubik+Mono+One&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Rubik', sans-serif;
}

body {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(135deg, #a9c05c 20%, #2da852 100%);
}

::selection {
  color: #f2f2f2;
  background: #000000;
}

/* Glassmorphism */
header {
  height: 85vh;
  width: 70%;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  z-index: 12;
  border-radius: 25px;
  margin: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

header .navbar {
  width: 100%;
  padding: 35px 50px;
  border-radius: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar .menu {
  display: flex;
  flex-wrap: wrap;
}

.navbar .logo {
  display: flex;
}

.navbar .logo img {
  height: 48px;
  width: auto;
  margin-right: 3px;
}

.navbar .logo a {
  text-decoration: none;
  font-size: 45px;
  color: #000;
  font-weight: 750;
}

.navbar .menu li {
  list-style: none;
  margin: 0 6px;
}

.navbar .menu a {
  color: #000;
  text-decoration: none;
  font-size: 17px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.navbar .menu a:hover {
  color: #f2f2f2;
}

.navbar .buttons input {
  outline: none;
  color: #f2f2f2;
  font-size: 18px;
  font-weight: 500;
  border-radius: 12px;
  padding: 6px 15px;
  border: none;
  margin: 0 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #c0af5c 10%, #a82d2d 100%);
}

.navbar .buttons input:hover {
  transform: scale(0.97);
}

header .content {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

header .content h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #000000;
  text-align: center;
}

header .content canvas {
  max-width: 100vh;
  max-height: 60vh; 
  height: auto;
  background-color: #f2f2f2c0;
  border-radius: 10px;
}

/* Responsive parts */
@media (max-width: 850px) {
  header .navbar {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 5px;
  }

  .navbar .menu {
    margin: 10px 0 20px 0;
  }

  header .content {
    width: 99%;
    height: 80%;
  }

  header .content h2 {
    font-size: 20px;
  }
}

@media (max-width: 700px) {
  header {
    height: 100vh;
    width: 100%;
    border-radius: 0px;
  }


  header .navbar {
    padding: 15px 10px;
  }
}
</style>
  