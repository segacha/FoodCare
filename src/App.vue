<template>
  <div>
      <h2>{{ title }}</h2>
      <input id="newProduct"/>&nbsp;
      <button @click="addNewProduct">Add Product</button>
      <p v-for="product in products" :key="product._id">
          <b>*{{ product.description }}</b>&nbsp;
          <button @click="deleteProduct(product.id)">Delete Product</button>
      </p>
  </div>
</template>

<script>
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
