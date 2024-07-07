<template>
  <body>
    <header>
      <nav class="navbar">
        <div class="logo">
          <img src="../assets/logo.png" alt="">
          <a href="#">FoodCare</a>
        </div>
        <ul class="menu">
          <li><a href="#">Home</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <div class="buttons">
          <input type="button" value="LogOut" @click="navigateToLogout" />
        </div>
      </nav>
      <div class="content">
        <div v-if="user">
          <h1>Welcome, {{ user.firstname }}!</h1>
        </div>  
        <section class="supermarket-list">
          <h2>Products 🛒</h2>
          <ul v-if="user">
            <li v-for="product in user.products" :key="product._id">{{ product.name }} - {{ product.expiring_date }}</li>
          </ul>
        </section>
      </div>
      <div class="upload-button">
        <form @submit.prevent="uploadImage">
          <label for="file-upload" class="custom-file-upload">Choose File</label>
          <input id="file-upload" type="file" @change="onFileChange" />
          <button type="submit">Upload Image</button>
        </form>
        <p v-if="message">{{ message }}</p>
      </div>
      <ModalPage :isVisible="isModalVisible" @close="isModalVisible = false">
        <h2>Set Expiry Dates for Products</h2>
        <div v-for="(product, index) in products" :key="index" class="product-input">
          <label>Product Name: {{ product.name }}</label>
          <input type="date" v-model="product.expiring_date" placeholder="Enter expiring date" />
        </div>
        <button @click="confirmExpiryDates">Confirm</button>
      </ModalPage>
    </header>
  </body>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { store } from '../store';
import { useRouter } from 'vue-router';
import ModalPage from '../components/ModalPage.vue';

export default {
  name: "HomePage",
  components: {
    ModalPage
  },
  setup() {
    const user = ref(store.user || JSON.parse(localStorage.getItem('user')));
    const selectedFile = ref(null);
    const message = ref('');
    const products = ref([]);
    const isModalVisible = ref(false);
    const router = useRouter();

    watch(() => store.user, (newUser) => {
      user.value = newUser;
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    });

    const fetchUserProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/foodcare/get_user/${user.value._id}`);
        if (response.data) {
          store.setUser(response.data); // Actualizar el usuario en el almacén
        }
      } catch (error) {
        console.error('Error fetching user products:', error);
      }
    };

    onMounted(() => {
      if (user.value) {
        fetchUserProducts();
      }
    });

    const onFileChange = async (event) => {
      const fileInput = event.target;
      const label = fileInput.previousElementSibling;
      if (fileInput.files && fileInput.files.length > 0) {
        label.classList.add('selected');
        selectedFile.value = fileInput.files[0];
        const formData = new FormData();
        formData.append('image', selectedFile.value);

        try {
          const response = await axios.post('http://localhost:3000/api/process_image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          products.value = response.data.items.map(item => ({
            name: item.name,
            expiring_date: ''
          }));
          isModalVisible.value = true;
        } catch (error) {
          console.error('Error processing image:', error);
          message.value = 'Error processing image';
        }
      } else {
        label.classList.remove('selected');
        selectedFile.value = null; // Reset
      }
    };

    const confirmExpiryDates = async () => {
      if (products.value.some(product => !product.expiring_date)) {
        message.value = 'Please enter expiring dates for all products';
        return;
      }
      isModalVisible.value = false;
      // Update products in the user object
      user.value.products = [...user.value.products, ...products.value];
      await fetchUserProducts(); // Ensure products are up-to-date
    };

    const uploadImage = async () => {
      if (!selectedFile.value) {
        message.value = 'Please select an image file first';
        return;
      }

      if (products.value.some(product => !product.expiring_date)) {
        message.value = 'Please enter expiring dates for all products';
        return;
      }

      const formData = new FormData();
      formData.append('image', selectedFile.value);
      formData.append('userId', user.value._id);
      formData.append('products', JSON.stringify(products.value));

      try {
        await axios.post('http://localhost:3000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.value = 'Image and product data uploaded successfully';
        await fetchUserProducts();
      } catch (error) {
        console.error('Error uploading image:', error);
        message.value = 'Error uploading image';
      }
    };

    const navigateToLogout = () => {
      store.setUser(null); // Limpiar el usuario en el almacén
      localStorage.removeItem('user'); // Remover usuario de localStorage
      router.push('/'); // Navegar a la página de bienvenida
    };

    return {
      user,
      onFileChange,
      confirmExpiryDates,
      uploadImage,
      selectedFile,
      message,
      navigateToLogout,
      products,
      isModalVisible
    };
  },
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

body{
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
.navbar .logo{
  display: flex;
}
.navbar .logo img{
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
  width: 40%;
  margin: 0 50px;
  flex: 1;
}

header .content h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #000000;
}


.supermarket-list {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.supermarket-list h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.supermarket-list ul {
  list-style: none;
}

.supermarket-list ul li {
  font-size: 16px;
  margin-bottom: 10px;
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
/* While selected, for better user expirience */
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

  .supermarket-list h2 {
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
