<script>
import HomePage from "../src/components/HomePage.vue"
import LoginPage from "../src/components/LoginPage.vue"
import Welcome_Page from "./components/Welcome_Page.vue";

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
        console.log("we are in the install user and the user is: " + user.products[0].name);
        this.user = user;
      },
      testing()
      {
        console.log("we are in testing...")
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

    <!-- <router-view></router-view> -->
    <div v-if="show_welcome_page" class="welcome_page">
      <Welcome_Page @login_register_clicked="toggle_login_page"></Welcome_Page>
    </div>

    <div v-if="show_login_page" class="login_page" >
      <!-- at the event of share_user in der login page, wir werden install_user methode aufrufen -->
      <!-- <LoginPage @share_user="testing" @switch_to_home_page="toggle_home_page"></LoginPage> -->
      <LoginPage @switch_to_home_page="toggle_home_page" @share_user="install_user"></LoginPage>
    </div>

    <div v-if="show_home_page" class="home_page">
      <HomePage :user="user"></HomePage>
    </div>

</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
}
body {
  height: 100vh;
  width: 100%;
  display: flex;
  background-image: linear-gradient(135deg, #a9c05c 10%, #2da852 100%);
  align-items: center;
  justify-content: center;
  flex-direction: column;
}


</style>

