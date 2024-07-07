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
          <li><router-link to="/contact">Contact</router-link></li>
        </ul>
        <div class="buttons">
          <input type="button" value="LogOut" @click="navigateToLogout"/>
        </div>
      </nav>
      <div class="content">
        <section class="shopping-list">
          <h2>Shop List 🛒</h2>
          <ul>
            <li v-for="(item, index) in shoppingList" :key="index">
              <input v-model="item.name" placeholder="Item Name"/>
              <input v-model="item.quantity" type="number" placeholder="Quantity"/>
              <button @click="removeItem(index)">Remove</button>
            </li>
          </ul>
          <button @click="addItem">Add Item</button>
        </section>
      </div>
    </header>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'ShoppingList',
    setup() {
      const shoppingList = ref([
        { name: '', quantity: 1 }
      ]);
  
      const addItem = () => {
        shoppingList.value.push({ name: '', quantity: 1 });
      };
  
      const removeItem = (index) => {
        shoppingList.value.splice(index, 1);
      };
  
      const navigateToLogout = () => {
        // Implementiere die Logout-Logik hier
      };
  
      return {
        shoppingList,
        addItem,
        removeItem,
        navigateToLogout
      };
    }
  };
  </script>