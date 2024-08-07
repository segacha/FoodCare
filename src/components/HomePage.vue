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
          <li><router-link to="/shopping-list">Shop List</router-link></li>
          <li><router-link to="/chart">Charts</router-link></li>
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
          <h2>Products on the watch 👀</h2>
          <div class="product-list scrollable">
            <ul v-if="user">
              <li v-for="product in user.products" :key="product._id">
                {{ product.name }}: {{ product.expiring_date }}
                <div class="dropdown-container">
                  <select v-model="product.receiving_date" class="styled-dropdown">
                    <option disabled value="Notify  before">Notification Date</option>
                    <option value="three_days">3 days before</option>
                    <option value="week">1 week before</option>
                    <option value="month">1 month before</option>
                  </select>
                  <span class="selected-value">{{ getDropdownLabel(product.receiving_date) }}</span>
                </div>
                <button class="delete-button" @click="removeProduct(product)">Delete</button>
              </li>
            </ul>
          </div>
          <div class="button-group">
            <button @click="cancelChanges">Cancel</button>
            <button @click="saveChanges">Save Changes</button>
          </div>
          <p v-if="saveMessage" class="save-message">{{ saveMessage }}</p>
        </section>
      </div>
      <div class="upload-button">
        <form @submit.prevent="uploadImage">
          <label for="file-upload" class="custom-file-upload">Upload Image</label>
          <input id="file-upload" type="file" @change="onFileChange" />
          <button type="submit" :disabled="isUploading">Confirm Image</button>
        </form>
        <p v-if="isUploading">Uploading, please wait...</p>
        <p v-if="message">{{ message }}</p>
      </div>
      <ModalPage :isVisible="isModalVisible" :products="products" @close="isModalVisible = false"
        @remove-product="removeProductFromModal" @confirm="confirmExpiryDates">
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
  setup()
  {
    const user = ref(store.user || JSON.parse(localStorage.getItem('user')));
    const selectedFile = ref(null);
    const message = ref('');
    const products = ref([]);
    const isModalVisible = ref(false);
    const router = useRouter();
    const saveMessage = ref('');
    const isUploading = ref(false);
    const processedProducts = ref([]);
    const totalprice = ref();

    watch(() => store.user, (newUser) =>
    {
      user.value = newUser;
      if (newUser)
      {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    });

    const fetchUserProducts = async () =>
    {
      try
      {
        const response = await axios.get(`http://localhost:3000/api/foodcare/get_user/${user.value._id}`);
        if (response.data)
        {
          store.setUser(response.data);
        }
      } catch (error)
      {
        console.error('Error fetching user products:', error);
        message.value = 'Failed to load products. Please try again later.';
      }
    };

    onMounted(() =>
    {
      if (user.value)
      {
        fetchUserProducts();
      }
    });

    const onFileChange = async (event) => 
    {
      const fileInput = event.target;
      const label = fileInput.previousElementSibling;
      if (fileInput.files && fileInput.files.length > 0) {
        label.classList.add('selected');
        selectedFile.value = fileInput.files[0];
        const formData = new FormData();
        formData.append('image', selectedFile.value);

        try {
          isUploading.value = true;
          const response = await axios.post('http://localhost:3000/api/process_image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log(response.data)//DEBUGGING
          processedProducts.value = response.data.items.map(item => ({
            name: item.name,
            expiring_date: ''
          }));

          const keys = Object.keys(response.data)
          products.value = [...processedProducts.value];
          if(keys[1] == 'total') {totalprice.value = response.data.total}
          else{ totalprice.value = response.data.total_amount} 

          isModalVisible.value = true;
        } catch (error) {
          console.error('Error processing, reload and try again', error);
          message.value = 'Error processing image, reload and try again';
        }finally{
          isUploading.value = false;
        }
      } else {
        label.classList.remove('selected');
        selectedFile.value = null;
      }
    };

    const confirmExpiryDates = async () =>
    {
      if (products.value.some(product => !product.expiring_date))
      {
        message.value = 'Please enter expiring dates for all products';
        return;
      }
      isModalVisible.value = false;
      user.value.products = [...user.value.products, ...products.value];
      await fetchUserProducts();
    };

    const uploadImage = async () => 
    {
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
      formData.append('total_amount', totalprice.value); // Include total_amount in the form data
      console.log(totalprice.value)//DEBUGGING

      try {
        await axios.post('http://localhost:3000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.value = 'Products data uploaded successfully';
        await fetchUserProducts();
      } catch (error) {
        console.error('Error uploading image:', error);
        message.value = 'Error uploading image. Please try again.';
      }
    };

    const removeProduct = async (product) =>
    {
      try
      {
        const response = await axios.delete(`http://localhost:3000/api/foodcare/delete_product`, { data: product });
        if (response.data)
        {
          await fetchUserProducts();
          message.value = 'Product removed successfully';
        }
      } catch (error)
      {
        console.error('Error removing product:', error);
        message.value = 'Error removing product';
      }
    };

    const update_receiving_date = async () => 
    {
      try 
      {
        for (const product of user.value.products)
        {
          if (product.receiving_date == "three_days")
          {
            product.email_receiving_date = new Date(product.expiring_date);
            product.email_receiving_date.setDate(new Date(product.expiring_date).getDate() - 3);
          }
          else if (product.receiving_date == "week")
          {
            product.email_receiving_date = new Date(product.expiring_date);
            product.email_receiving_date.setDate(new Date(product.expiring_date).getDate() - 7);
          }
          else if (product.receiving_date == "month")
          {
            product.email_receiving_date = new Date(product.expiring_date);
            product.email_receiving_date.setDate(new Date(product.expiring_date).getDate() - 30);
          }
        }

        await axios.put(`http://localhost:3000/api/foodcare/update_products`, { data: user.value.products });
        console.log("product email recving date: " + user.value.products[0].email_receiving_date);
        message.value = 'Successfully Updated!';

      } catch (error) 
      {
        console.error('Error saving changes:', error);
        saveMessage.value = 'Error saving changes';
      }
    };

    const cancelChanges = async () =>
    {
      await fetchUserProducts();
    };

    const navigateToLogout = () =>
    {
      store.setUser(null); 
      localStorage.removeItem('user');
      router.push('/'); 
    };

    const getDropdownLabel = (value) => 
    {
      switch (value) {
        case 'three_days':
          return '';
        case 'week':
          return '';
        case 'month':
          return '';
        default:
          return 'Notify when?';
      }
    };

    const removeProductFromModal = (index) => 
    {
      products.value.splice(index, 1);
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
      isModalVisible,
      removeProduct,
      saveChanges: update_receiving_date,
      cancelChanges,
      saveMessage,
      isUploading,
      getDropdownLabel,
      removeProductFromModal
    };
  },
};
</script>

<style scoped>
/* Include your styles here */
</style>


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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.supermarket-list h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
}

.scrollable {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.scrollable::-webkit-scrollbar {
  width: 8px;
}

.scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
  border: 2px solid #f1f1f1;
}

.scrollable::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

.dropdown-container {
  position: relative;
  display: inline-block;
}

.styled-dropdown {
  appearance: none;
  background: none;
  border: 1px solid #ccc;
  padding: 5px 10px;
  font-size: 14px;
}

.styled-dropdown:focus {
  outline: none;
  border-color: #007bff;
}

.selected-value {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #555;
}

.supermarket-list ul {
  list-style: none;
}

.supermarket-list ul li {
  font-size: 16px;
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}



button.delete-button {
  outline: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 12px;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #ff6666 10%, #c94747 100%);
}

button.delete-button:hover {
  transform: scale(0.97);
}


.button-group button {
  outline: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 12px;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #a9c05c 10%, #2da852 100%);
}

.button-group button:hover {
  transform: scale(0.97);
}

.save-message {
  text-align: right;
  color: green;
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
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

/*Responsive parts*/
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
