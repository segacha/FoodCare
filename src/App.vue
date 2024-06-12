<script>
import HomePage from "./components/HomePage.vue"
import LoginPage from "./components/LoginPage.vue"
import Welcome_Page from "./components/Welcome_Page.vue";
import axios from 'axios';

export default
  {
    name: 'App',
    components:
    {
      HomePage,
      LoginPage,
      Welcome_Page
    },
    data()
    {
      return {
        user: "null",
        show_welcome_page: true,
        show_login_page: false, 
        show_home_page: false
      }
    },
    methods:
    {
      install_user(user)
      {
        console.log("we are in the install user and the user is: " + user);
        this.user = user;
      },
      async refreshUser()//Is always Uptodate with the user
      {
        try {
            const response = await axios.get(`http://localhost:3000/api/foodcare/get_user_by_email/${this.user.email}`);
            this.user = response.data.user;
        } catch (error) {
          console.error('Error refreshing user:', error);
        }
      },
      toggle_welcome_page()
      {
        this.show_welcome_page = !this.show_welcome_page;
      },
      toggle_login_page()
      {
        this.show_welcome_page = false;
        this.show_login_page = !this.show_login_page;
      },
      toggle_home_page()
      {
        this.show_login_page = false;
        this.show_home_page = !this.show_home_page;
      }
    }
  }
</script>


<template>

    <div v-if="show_welcome_page" class="welcome_page">
      <Welcome_Page @login_register_clicked="toggle_login_page"></Welcome_Page>
    </div>

    <div v-if="show_login_page" class="login_page" >
      <LoginPage @switch_to_home_page="toggle_home_page" @share_user="install_user"></LoginPage>
    </div>

    <div v-if="show_home_page" class="home_page">
      <HomePage :user="user" @user-updated="refreshUser"></HomePage>
    </div>
</template>

<style>
.welcome_page{
  height: 100vh;
  width: 100%;
  display: flex;
  background-image: linear-gradient(135deg, #a9c05c 20%, #2da852 100%);
  justify-content: center;
  align-items: center;
}

.home_page{
  height: 100vh;
  width: 100%;
  display: flex;
  background-image: linear-gradient(135deg, #a9c05c 20%, #2da852 100%);

}

.login_page{
  background-color: #c9d6ff;
  background: linear-gradient(to right, #e2e2e2, #daffc9);
  display: flex;    
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh; 
}
</style>

