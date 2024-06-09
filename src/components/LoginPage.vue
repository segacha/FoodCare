<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
<!-- <body>
 -->  <div class="container" id="container">
    <!-- Sign-up form container -->
    <div class="form-container sign-up">
      <form @submit.prevent="register">
        <h1>Create Account</h1>
        <div class="social-icons">
          <a href="#" class="icon"><i class="fa-brands fa-google"></i></a>
          <a href="#" class="icon"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" class="icon"><i class="fa-brands fa-github"></i></a>
        </div>
        <span>or use your email for registration</span>
        <input type="text" placeholder="First Name" v-model="registerUser.firstname" required>
        <input type="text" placeholder="Last Name" v-model="registerUser.lastname" required>
        <input type="email" placeholder="Email" v-model="registerUser.email" required>
        <input type="password" placeholder="Password" v-model="registerUser.password" required>
        <button type="submit">SIGN UP</button>
      </form>
    </div>
    <!-- Sign-in form container -->
    <div class="form-container sign-in">
      <form @submit.prevent="login">
        <h1>Sign In</h1>
        <div class="social-icons">
          <a href="#" class="icon"><i class="fa-brands fa-google"></i></a>
          <a href="#" class="icon"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" class="icon"><i class="fa-brands fa-github"></i></a>
        </div>
        <span>or use your email and password</span>
        <input type="email" placeholder="Email" v-model="loginUser.email" required>
        <input type="password" placeholder="Password" v-model="loginUser.password" required>
        <a href="#">Forget Your Password?</a>
        <button type="submit">SIGN IN</button>
      </form>
    </div>
    <!-- Toggle container for switching between sign-in and sign-up -->
    <div class="toggle-container">
      <div class="toggle">
        <div class="toggle-panel toggle-left">
          <h1>Welcome!</h1>
          <p>Enter your personal details and save some Food!</p>
          <button class="hidden" id="login" @click="switchToLogin">SIGN IN</button>
        </div>
        <div class="toggle-panel toggle-right">
          <h1>Hello, Broksy!</h1>
          <p>Register with your personal details and start saving</p>
          <button class="hidden" id="register" @click="switchToRegister">SIGN UP</button>
        </div>
      </div>
    </div>
  </div>
<!-- </body>
 --></template>

<script>
import axios from 'axios';
console.log("we are in login page")

axios.defaults.baseURL = 'http://localhost:3000/api';

export default {
  name: 'AuthPage',
  emits: ['share_user', 'switch_to_home_page'],
  data() {
    return {
      registerUser: {
        firstname: '',
        lastname: '',
        email: '',
        password: ''
      },
      loginUser: {
        email: '',
        password: ''
      },
      loading: false,
      error: null,
      switch_to_home_page: false
    };
  },
  methods: {
    async share_user()
    {
      //share_user is the event name
      //LoginUser ist was wir zu den Eltern comonent weitergeben moechten
      try
      {
        console.log("we are in the share_user in LoginPage")
        const email = this.loginUser.email;
        console.log("email is: " + email);
        const api_url = "http://localhost:3000/api/foodcare/get_user_by_email/" + email;
        const response = await axios.get(api_url);
        console.log("user is: " + response.data.user.firstname);
        this.$emit('share_user', response.data.user);
      }
      catch(error)
      {
        console.log("we had error while trying to share the user in LoginPage: " + error);
      }

    },
    switchToLogin() {
      const container = document.getElementById('container');
      container.classList.remove('active');
    },
    switchToRegister() {
      const container = document.getElementById('container');
      container.classList.add('active');
    },
    async register() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/user/create', this.registerUser);
        const data = response.data;
        if (data.status) {
          alert('User registered successfully');
          this.switchToLogin(); // Switch to login form after successful registration
        } else {
          alert('Registration failed');
        }
      } catch (err) {
        this.error = 'An error occurred while registering the user.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async login() {
      this.loading = true;
      this.error = null;
      try {
        const api_url = "http://localhost:3000/api/foodcare/get_user_by_email/" + this.loginUser.email; 
        const response = await axios.get(api_url);
        const data = response.data;
        if (data.status) {
          alert('Login Successfully');

          await this.share_user();
          this.switch_to_home_page = true;
          //emit event heisst: "switch_to_home_page", und geben den wert weiter ab
          this.$emit('switch_to_home_page', this.switch_to_home_page);
          //reverse wert
          this.switch_to_home_page = false;
        } else {
          alert('Login Failed');
        }
      } catch (err) {
        console.error('Error during login:', err);
        alert('Error, please try again');
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    registerBtn.addEventListener('click', this.switchToRegister);
    loginBtn.addEventListener('click', this.switchToLogin);
  }
};
</script>

<style scoped>

.form-control {
  margin-bottom: 10px;
}
</style>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

*{
    margin: 0; /* Reset margin */
    padding: 0; /* Reset padding */
    box-sizing: border-box; /* Include padding and border in element's total width and height */
    font-family: 'Montserrat', sans-serif; /* Set font family */
}

.container{
    background-color: #fff;
    border-radius: 30px; /* Rounded corners */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35); /* Box shadow */
    position: relative;
    overflow: hidden; /* Hide overflow */
    width: 768px;
    max-width: 100%;
    min-height: 480px;
}

.container p{
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.3px;
    margin: 20px 0;
}

.container span{
    font-size: 12px;
}

.container a{
    color: #333;
    font-size: 14px;
    text-decoration: none;
}

.container button{
    background-color: #2da83b; /* Button background color */
    color: #fff; /* Button text color */
    font-size: 12px;
    padding: 10px 45px;
    border: 1px solid transparent;
    border-radius: 8px; /* Rounded corners */
    font-weight: 600;
    letter-spacing: 0.5px; /* Letter spacing */
    margin-top: 10px;
    cursor: pointer; /* Pointer cursor on hover */
}

.container button.hidden{
    background-color: transparent; /* Transparent background */
    border-color: #fff; /* White border */
}

.container form{
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 40px;
    height: 100%;
}

.container input{
    background-color: #eee;
    border: none;
    margin: 8px 0;
    padding: 10px 15px;
    font-size: 13px;
    border-radius: 8px; /* Rounded corners */
    width: 100%;
    outline: none; /* Remove outline */
}

.form-container{
    position: absolute;
    height: 100%;
    transition: all 0.6s ease-in-out;
}

.sign-in{
    left: 0;
    width: 50%;
    z-index: 2;
}

.container.active .sign-in{
    transform: translateX(100%);
}

.sign-up{
    left: 0;
    width: 50%;
    z-index: 1;
}

.container.active .sign-up{
    transform: translateX(100%);
    z-index: 5;
    animation: move 0.6s;
}

@keyframes move{
    0%, 49.99%{
        z-index: 1;
    }
    50%, 100%{
        z-index: 5;
    }
}

.social-icons{
    margin:15px 0;
}

.social-icons a{
    border: 1px solid #ccc;
    border-radius: 20%; 
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 0 3px;
    width: 40px;
    height: 40px;
}

.toggle-container{
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: all 0.6s ease-in-out;
    border-radius: 150px 0 0 100px;
    z-index: 1000;
}

.container.active .toggle-container{
    transform: translateX(-100%);
    border-radius: 0 150px 100px 0;
}

.toggle{
    background-color: #512da8;
    height: 100%;
    background: linear-gradient(to right, #a9c05c, #2da852); /* Background gradient */
    color: #fff;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: all 0.6s ease-in-out;
}

.container.active .toggle{
    transform: translateX(50%);
}

.toggle-panel{
    position: absolute;
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 30px;
    text-align: center;
    top: 0;
    transform: translateX(0);
    transition: all 0.6s ease-in-out;
}

.toggle-left{
    transform: translateX(-200%);
}

.container.active .toggle-left{
    transform: translateX(0);
}

.toggle-right{
    right: 0;
    transform: translateX(0);
}

.container.active .toggle-right{
    transform: translateX(200%);
}
</style>