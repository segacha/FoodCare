<template>
  <header>
    <nav class="navbar">
      <div class="logo">
        <a href="#">
          FoodCare
        </a>
      </div>
      <ul class="menu">
        <li><a href="#">Home</a></li>
        <li><a href="#">Latest</a></li>
        <li><a href="#">Offers</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
      <div class="buttons">
        <input type="button" value="LogOut" @click="navigateToLogout" />
      </div>
    </nav>
    <div class="content">
      <section class="supermarket-list">
        <h2>Supermarket Items</h2>
        <ul v-if="user">
            <li>{{user.firstname}} has the following products:</li>
            <ul>
              <li v-for="product in user.products" :key="product._id">{{product.name}} and expires at: {{product.expiring_date}}</li>
            </ul>
        </ul>
      </section>
    </div>
    <div class="upload-button">
      <form @submit.prevent="uploadImage">
        <input type="file" @change="onFileChange" />
        <button type="submit">Upload Image</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
  </header>
</template>
<script>
import { ref } from 'vue';
import axios from 'axios';
export default
  {
    name: "HomePage",
    type: Object,
    required: true,
    props: {
      user: {
        type: Object,
        required: false,
        validator: (value) =>
        {
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
    data()
    {
      return {
        show_login_page: false,
        
      }
    },
    setup()
    {
      const selectedFile = ref(null);  // Define selectedFile como ref
      const message = ref('');         // Define message como ref para mostrar mensajes

      const onFileChange = (event) =>
      {
        selectedFile.value = event.target.files[0];
      };

      const uploadImage = async () =>
      {
        if (!selectedFile.value)
        {
          message.value = 'Please select an image file first';
          return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile.value);

        try
        {
          const response = await axios.post('http://localhost:3000/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          message.value = 'Image uploaded successfully: ' + response.data.message;
          console.log('Image uploaded successfully:', response.data);
        } catch (error)
        {
          console.error('Error uploading image:', error);
          message.value = 'Error uploading image';
        }
      };

      return {
        onFileChange,
        uploadImage,
        selectedFile,  // Asegúrate de devolver selectedFile
        message        // Asegúrate de devolver message
      };
    },
  };
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap');

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

.navbar .logo a {
  text-decoration: none;
  font-size: 22px;
  color: #000;
  font-weight: 500;
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

.upload-button input {
  outline: none;
  color: #f2f2f2;
  font-size: 18px;
  font-weight: 500;
  border-radius: 12px;
  padding: 6px 15px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #a9c05c 10%, #2da852 100%);

}

.upload-button input:hover {
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

@media (max-width: 410px) {
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