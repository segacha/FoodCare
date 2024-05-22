<template>
  <div>
    <!-- Input field for new product and button to add product -->
    <input id="newProduct" />&nbsp;
    <button @click="addNewProduct">Add Product</button>
    
    <!-- List of products fetched from the server -->
    <p v-for="product in products" :key="product._id">
      <ul>
        <li><b>{{ product.description }}</b>&nbsp;</li>
        <button @click="deleteProduct(product.id)">Delete Product</button>
      </ul>
    </p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'; // Import necessary functions from Vue
import axios from 'axios'; // Import axios for making HTTP requests

const API_URL = 'http://localhost:3000/'; // Base URL for API endpoints

export default {
  setup() {
    const products = ref([]); // Reactive array to store products

    // Function to fetch products data from the server
    const refreshData = async () => {
      try {
        const response = await axios.get(API_URL + 'api/foodcare/GetProducts');
        products.value = response.data; // Update products with fetched data
      } catch (error) {
        console.error('Error fetching products:', error); // Log any errors
      }
    };

    // Function to add a new product to the server
    const addNewProduct = async () => {
      try {
        const newProduct = document.getElementById('newProduct').value; // Get new product value from input
        const formData = new FormData();
        formData.append('newProduct', newProduct);

        const response = await axios.post(API_URL + 'api/foodcare/AddProduct', formData); // Send new product data to server
        refreshData(); // Refresh products data
        alert(response.data); // Alert the user with the response
      } catch (error) {
        console.error('Error adding new product:', error); // Log any errors
        alert('An error occurred while adding new product.');
      }
    };

    // Function to delete a product from the server
    const deleteProduct = async (id) => {
      try {
        const response = await axios.delete(API_URL + 'api/foodcare/DeleteProduct?id=' + id); // Send delete request to server
        refreshData(); // Refresh products data
        alert(response.data); // Alert the user with the response
      } catch (error) {
        console.error('Error deleting product:', error); // Log any errors
        alert('An error occurred while deleting product.');
      }
    };

    // Fetch initial products data when the component is mounted
    onMounted(() => {
      refreshData();
    });

    return {
      products,
      addNewProduct,
      deleteProduct
    };
  }
};
</script>


