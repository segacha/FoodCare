<template>
  <div>
    <h1>Users</h1>

    <input v-model="user_id" placeholder="what id does the user have who wants to add this product?" />
    <input v-model="product_name" placeholder="add product name" />
    <input v-model="product_description" placeholder="add a user description" />
    <input v-model="product_expiring_date" placeholder="add a product's expiring_date" />
    <button @click="add_product">Add Product</button>

    <ul>
      <li v-for="user in users" :key="user._id">
        The User: {{ user.firstname }} {{ user.lastname }} with the id: {{ user._id }} has the following info: <br />
        <ul>
          <li>Email: {{ user.email }}</li>
          <li>And these iteams:</li>
          <ul v-for="product in user.products" :key="product._id">
            <li>{{ product.name }} which expiers at: {{ product.expiring_date }} and has the discription:</li>
            <ul>
              <li>{{ product.description }}</li>
            </ul>
          </ul>
        </ul>

        <br /><br />
      </li>
    </ul>
    <br />
  </div>
</template>

<script>
import axios from "axios";

export default {
  data()
  {
    return {
      users: [],
      user_id: "",
      product_name: "",
      product_description: "",
      product_expiring_date: ""
    };
  },
  methods:
  {

    async get_users()
    {
      const response = await axios.get("http://localhost:3000/api/foodcare/get_users");
      this.users = response.data;
      const users = await response.data;
      //await this.print_users_products(users)
      return users;
    },
    async get_user_products(user_id)
    {
      const api_url = "http://localhost:3000/api/foodcare/get_user/" + user_id;
      const user = await axios.get(api_url);
      const products = user.products;
      return products;
    },

    async add_product() 
    {
      const product =
      {
        name: this.product_name,
        description: this.product_description,
        expiring_date: this.product_expiring_date
      }
      const url_string = "http://localhost:3000/api/foodcare/add_product/" + this.user_id
      const response = await axios.post(url_string, product);

      this.users.push(response.data);

      //reseting the input for values after pushing the last user to db
      this.user_id = ""
      this.product_name = "";
      this.product_description = "";
      this.product_expiring_date = "";
    },
  },
  created()
  {
    this.get_users();
  },
};
</script>

<style scoped>
/* Add some basic styling if needed */
</style>