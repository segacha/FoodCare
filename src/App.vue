<template>
    <div>
        <header class="top-section">
            <nav>
                <ul>
                    <li><a href="#">Inicio</a></li>
                    <li><a href="#">Productos</a></li>
                    <li><a href="#">Acerca de</a></li>
                </ul>
            </nav>
            <div class="centered-content">
                <div class="logo-title-container">
                    <img class="logo" src="./assets/logo.png" alt="Logo de FoodCare">
                    <h1>{{ title }}</h1>
                </div>
            </div>
            <a href="#" class="account-button">Ingresar</a>
        </header>
    </div>
    <main class="bottom-section">
      <router-view></router-view> <!-- Placeholder for router views -->
    </main>
</template>

<script scoped>
import './styles/style.css'; // Import custom styles
import { ref, onMounted } from 'vue'; // Import necessary functions from Vue
import axios from 'axios'; // Import axios for making HTTP requests
import { useRouter } from 'vue-router'; // Import useRouter for programmatic navigation

const API_URL = 'http://localhost:3000/'; // Base URL for API endpoints

export default {
  setup() {
    const title = ref("Food Care"); // Reactive title data
    const products = ref([]); // Reactive products array
    const router = useRouter(); // Router instance

    // Function to fetch products data from the server
    const refreshData = async () => {
      try {
        const response = await axios.get(API_URL + "api/foodcare/GetProducts");
        products.value = response.data; // Update products with fetched data
      } catch (error) {
        console.error('Error fetching notes:', error); // Log any errors
      }
    };

    // Function to add a new product to the server
    const addNewProduct = async () => {
      try {
        const newProduct = document.getElementById("newProduct").value; // Get new product value from input
        const formData = new FormData();
        formData.append("newProduct", newProduct);

        const response = await axios.post(API_URL + "api/foodcare/AddProduct", formData); // Send new product data to server
        refreshData(); // Refresh products data
        alert(response.data); // Alert the user with the response
      } catch (error) {
        console.error('Error adding new Product:', error); // Log any errors
        alert('An error occurred while adding new Product.');
      }
    };

    // Function to delete a product from the server
    const deleteProduct = async (id) => {
      try {
        const response = await axios.delete(API_URL + "api/foodcare/DeleteProduct?id=" + id); // Send delete request to server
        refreshData(); // Refresh products data
        alert(response.data); // Alert the user with the response
      } catch (error) {
        console.error('Error deleting note:', error); // Log any errors
        alert('An error occurred while deleting note.');
      }
    };

    // Fetch initial products data when the component is mounted
    onMounted(() => {
      refreshData();
    });

    // Function to navigate to the login page
    const navigateToLogin = () => {
      router.push('/login');
    }

    return {
      title,
      products,
      addNewProduct,
      deleteProduct,
      navigateToLogin
    };
  }
};
</script>


  
