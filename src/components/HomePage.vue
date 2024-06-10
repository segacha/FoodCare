<template>
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
  </header>
</template>

<script>
import { ref, toRefs } from 'vue';
import axios from 'axios';

export default {
  name: "HomePage",
  props: {
    user: {
      type: Object,
      required: true,
      validator: (value) => {
        return (
          typeof value._id === 'string' &&
          typeof value.firstname === 'string' &&
          typeof value.lastname === 'string' &&
          typeof value.email === 'string' &&
          typeof value.password === 'string' &&
          Array.isArray(value.products) &&
          typeof value.__v === 'number'
        );
      },
    },
  },
  setup(props, { emit }) {
    const { user } = toRefs(props);
    const selectedFile = ref(null);
    const message = ref('');

    const onFileChange = (event) => { // Cambiado a función flecha
      const fileInput = event.target;
      const label = fileInput.previousElementSibling;
      if (fileInput.files && fileInput.files.length > 0) {
        label.classList.add('selected');
        selectedFile.value = fileInput.files[0]; // Asignar el archivo seleccionado
      } else {
        label.classList.remove('selected');
        selectedFile.value = null; // Resetear el archivo seleccionado
      }
    };
    const uploadImage = async () => {
      if (!selectedFile.value) {
        message.value = 'Please select an image file first';
        return;
      }

      const formData = new FormData();
      formData.append('image', selectedFile.value);
      formData.append('userId', user.value._id); // Añadir el ID del usuario


      try {
        const response = await axios.post('http://localhost:3000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.value = 'Image uploaded successfully: ' + response.data.message;
        console.log('Image uploaded successfully:', response.data);
        emit('user-updated'); 
      } catch (error) {
        console.error('Error uploading image:', error);
        message.value = 'Error uploading image';
      }
    };

    return {
      onFileChange,
      uploadImage,
      selectedFile,
      message
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

/*When selected with the mouse*/
::selection {
  color: #f2f2f2;
  background: #000000;
}

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
  display: inline-block; /* Label wird als eine Button funktioniert */
}

.custom-file-upload:hover {
  background-color: #000;
  color: #fff;
}

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