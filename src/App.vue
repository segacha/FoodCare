<template>
        <!-- Top section containing the navigation and logo -->
    <header class="top-section">
      <nav>
        <ul>
          <li><a href="#home">Home</a></li> <!-- Navigation link to Home -->
          <li><a href="#product">Product</a></li> <!-- Navigation link to Products -->
          <li><a href="#about">About us</a></li> <!-- Navigation link to About -->
        </ul>
      </nav>
      <div class="centered-content">
        <div class="logo-title-container">
          <img class="logo" src="./assets/logo.png" alt="Logo de FoodCare"> <!-- Company logo -->
          <h1>{{ title }}</h1> <!-- Title from the component data -->
        </div>
      </div>
      <a href="#" class="account-button" @click="navigateToLogin">Anmelden</a> <!-- Button to navigate to login page -->
    </header>
    
    <main class="bottom-section">
      <router-view></router-view> <!-- Placeholder for router views -->
    </main>
</template>

<script scoped>
import './styles/style.css'; // Import custom styles
import { useRouter } from 'vue-router'; // Import useRouter for programmatic navigation



export default {
  setup() {
    const title =   ("Food Care"); // Reactive title data
    const router = useRouter(); // Router instance


    // Function to navigate to the login page
    const navigateToLogin = () => {
      router.push('/login');
    }

    return {
      title,
      navigateToLogin
    };
  }
};
</script>


  
