<template>
    <div>
        <header class="top-section">
            <nav>
                <ul>
                    <li><a href="#">Home</a></li>
                    <li><a href="#">XYZ</a></li>
                    <li><a href="#">About us</a></li>
                </ul>
            </nav>
            <div class="centered-content">
                <div class="logo-title-container">
                    <img class="logo" src="./assets/logo.png" alt="Logo de FoodCare">
                    <h1>{{ title }}</h1>
                </div>
            </div>
            <a href="#" class="account-button">Log in</a>
        </header>
    </div>
    <main class="bottom-section">
      <input id="newProduct"/>&nbsp;
      <button @click="addNewProduct">Add Product</button>
      <p v-for="product in products" :key="product._id">
        <ul>
          <li><b>{{ product.description }}</b>&nbsp;</li>
          <button @click="deleteProduct(product.id)">Delete Product</button>
        </ul>
        </p>
    </main>
</template>

<script>
import './styles/style.css';
import { ref, onMounted } from 'vue';
import axios from 'axios';
const API_URL = 'http://localhost:3000/';

export default {
  setup() {
      const title = ref("Food Care");
      const products = ref([]);
      
      const refreshData = async () => {
          try {
              const response = await axios.get(API_URL + "api/foodcare/GetProducts");
              products.value = response.data;
          } catch (error) {
              console.error('Error fetching notes:', error);
          }
      };

      const addNewProduct = async () => {
          try {
              const newProduct = document.getElementById("newProduct").value;
              const formData = new FormData();
              formData.append("newProduct", newProduct);

              const response = await axios.post(API_URL + "api/foodcare/AddProduct", formData);
              refreshData();
              alert(response.data);
          } catch (error) {
              console.error('Error adding new Product:', error);
              alert('An error occurred while adding new Product.');
          }
      };

      const deleteProduct = async (id) => {
          try {
              const response = await axios.delete(API_URL + "api/foodcare/DeleteProduct?id=" + id);
              refreshData();
              alert(response.data);
          } catch (error) {
              console.error('Error deleting note:', error);
              alert('An error occurred while deleting note.');
          }
      };

      onMounted(() => {
          refreshData();
      });

      return {
          title,
          products,
          addNewProduct,
          deleteProduct
      };
  }
};
</script>
