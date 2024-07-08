<template>
  <body>
  <header>
    <nav class="navbar">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo">
        <a href="#">FoodCare</a>
      </div>
      <ul class="menu">
        <li><router-link to="/login">Login</router-link></li>
        <li><router-link to="/home">Home</router-link></li>
        <li><router-link to="/shopping-list">Shop List</router-link></li>
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
          <li v-for="(item, index) in shoppingList" :key="item._id">
            <input v-model="item.name" placeholder="Item Name"/>
            <input v-model="item.quantity" type="number" placeholder="Quantity"/>
            <button @click="removeItem(item._id, index)">Remove</button>
          </li>
        </ul>
        <button @click="addItem">Add Item</button>
        <button @click="saveShoppingList">Save Shopping List</button>
        <p v-if="message">{{ message }}</p>
      </section>
    </div>
  </header>
</body>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { store } from '../store';
import { useRouter } from 'vue-router';

export default {
  name: 'ShoppingPage',
  setup() {
    const user = ref(store.user || JSON.parse(localStorage.getItem('user')));
    const shoppingList = ref([]);
    const message = ref('');

    const fetchShoppingList = async () => {
      if (!user.value || !user.value._id) {
        console.error('User ID is undefined');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/user/${user.value._id}/shopping-list`);
        shoppingList.value = response.data;
      } catch (error) {
        console.error('Error fetching shopping list:', error);
      }
    };

    const addItem = () => {
      shoppingList.value.push({ name: '', quantity: 1 });
    };

    const removeItem = async (itemId, index) => {
      if (!user.value || !user.value._id) {
        console.error('User ID is undefined');
        return;
      }

      try {
        await axios.delete(`http://localhost:3000/api/user/${user.value._id}/shopping-list/${itemId}`);
        shoppingList.value.splice(index, 1);
        message.value = 'Item removed from shopping list';
      } catch (error) {
        console.error('Error removing item from shopping list:', error);
        message.value = 'Error removing item from shopping list';
      }
    };

    const saveShoppingList = async () => {
      if (!user.value || !user.value._id) {
        console.error('User ID is undefined');
        return;
      }

      try {
        await axios.post(`http://localhost:3000/api/user/${user.value._id}/shopping-list`, {
          shoppingList: shoppingList.value
        });
        message.value = 'Shopping list saved';
      } catch (error) {
        console.error('Error saving shopping list:', error);
        message.value = 'Error saving shopping list';
      }
    };

    const navigateToLogout = () => {
      store.setUser(null); // Limpiar el usuario en el almacén
      localStorage.removeItem('user'); // Remover usuario de localStorage
      useRouter().push('/'); // Navegar a la página de bienvenida
    };

    watch(() => store.user, (newUser) => {
      user.value = newUser;
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    });

    onMounted(() => {
      if (user.value) {
        fetchShoppingList();
      }
    });

    return {
      user,
      shoppingList,
      addItem,
      removeItem,
      saveShoppingList,
      navigateToLogout,
      message
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
  font-family: 'Rubik';
}

body {
  height: 100vh;
  width: 100%;
  display: flex;
  background-image: linear-gradient(135deg, #a9c05c 20%, #2da852 100%);
}

/*When selected with the mouse*/
::selection {
  color: #f2f2f2;
  background: #000000;
}

/*Glassmorphism*/
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
  margin: auto;
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
  margin: 0 50px;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

header .content h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #000000;
}

.shopping-list {
  background: #ffffff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 600px;
}

.shopping-list h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.shopping-list ul {
  list-style: none;
  padding: 0;
}

.shopping-list ul li {
  font-size: 16px;
  margin-bottom: 10px;
}

.shopping-list ul li input {
  margin-right: 10px;
  padding: 5px;
}

.shopping-list ul li button {
  outline: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #ff5c5c 10%, #ff0000 100%);
}

.shopping-list ul li button:hover {
  transform: scale(0.97);
}

.shopping-list button {
  outline: none;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  padding: 6px 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #a9c05c 10%, #2da852 100%);
  margin-top: 10px;
  margin-right: 10px;
}

.shopping-list button:hover {
  transform: scale(0.97);
}

.upload-button {
  position: absolute;
  right: 20px;
  bottom: 20px;
}

.upload-button form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.upload-button input[type="file"] {
  display: none;
}

.custom-file-upload {
  outline: none;
  font-size: 16px;
  font-weight: 500;
  padding: 6px 15px;
  border-radius: 12px;
  border: 2px solid #2da852;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fff;
  color: #2da852;
  display: inline-block;
}

.custom-file-upload:hover {
  background-color: #000;
  color: #fff;
}

/* While selected, for better user experience */
.custom-file-upload.selected {
  background-color: #2da852;
  color: #fff;
  border: 2px solid #fff;
}

.upload-button input[type="file"]:hover {
  background-color: #2da852;
  color: #fff;
}

.upload-button button {
  outline: none;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  border-radius: 12px;
  padding: 6px 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #a9c05c 10%, #2da852 100%);
}

.upload-button button:hover {
  transform: scale(0.97);
}

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
    margin: 30px 0 0 20px;
    width: 70%;
  }

  .shopping-list h2 {
    font-size: 20px;
  }
}

@media (max-width: 389px) {
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
