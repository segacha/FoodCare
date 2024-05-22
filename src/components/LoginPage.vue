<template>
  <!-- Link to external stylesheet for Font Awesome icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
  <body>
  <div class="container" id="container">
    <!-- Sign-up form container -->
    <div class="form-container sign-up">
      <form>
        <h1>Create Account</h1>
        <div class="social-icons">
          <a href="#" class="icon"><i class="fa-brands fa-google"></i></a> <!-- Google icon -->
          <a href="#" class="icon"><i class="fa-brands fa-facebook-f"></i></a> <!-- Facebook icon -->
          <a href="#" class="icon"><i class="fa-brands fa-github"></i></a> <!-- GitHub icon -->
        </div>
        <span>or use your email for registration</span>
        <input type="text" placeholder="Name"> <!-- Input field for name -->
        <input type="email" placeholder="Email"> <!-- Input field for email -->
        <input type="password" placeholder="Password"> <!-- Input field for password -->
        <button>SIGN UP</button> <!-- Sign-up button -->
      </form>
    </div>
    <!-- Sign-in form container -->
    <div class="form-container sign-in">
      <form>
        <h1>Sign In</h1>
        <div class="social-icons">
          <a href="#" class="icon"><i class="fa-brands fa-google"></i></a> <!-- Google icon -->
          <a href="#" class="icon"><i class="fa-brands fa-facebook-f"></i></a> <!-- Facebook icon -->
          <a href="#" class="icon"><i class="fa-brands fa-github"></i></a> <!-- GitHub icon -->
        </div>
        <span>or use your email and password</span>
        <input type="email" placeholder="Email"> <!-- Input field for email -->
        <input type="password" placeholder="Password"> <!-- Input field for password -->
        <a href="#">Forget Your Password?</a> <!-- Link to forget password -->
        <button>SIGN IN</button> <!-- Sign-in button -->
      </form>
    </div>
    <!-- Toggle container for switching between sign-in and sign-up -->
    <div class="toggle-container">
      <div class="toggle">
        <div class="toggle-panel toggle-left">
          <h1>Welcome!</h1>
          <p>Enter your personal details and save some Food!</p>
          <button class="hidden" id="login" @click="switchToLogin">SIGN IN</button> <!-- Switch to sign-in -->
        </div>
        <div class="toggle-panel toggle-right">
          <h1>Hello, Broksy!</h1>
          <p>Register with your personal details and start saving</p>
          <button class="hidden" id="register" @click="switchToRegister">SIGN UP</button> <!-- Switch to sign-up -->
        </div>
      </div>
    </div>
  </div>
</body>
</template>

<script>
export default {
  methods: {
    // Method to switch to login form
    switchToLogin() {
      const container = document.getElementById('container');
      container.classList.remove('active');
    },
    // Method to switch to register form
    switchToRegister() {
      const container = document.getElementById('container');
      container.classList.add('active');
    }
  },
  // Lifecycle hook called when the component is mounted
  mounted() {
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    registerBtn.addEventListener('click', this.switchToRegister);
    loginBtn.addEventListener('click', this.switchToLogin);
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

*{
    margin: 0; /* Reset margin */
    padding: 0; /* Reset padding */
    box-sizing: border-box; /* Include padding and border in element's total width and height */
    font-family: 'Montserrat', sans-serif; /* Set font family */
}

body{
    background-color: #c9d6ff;
    background: linear-gradient(to right, #e2e2e2, #daffc9); /* Background gradient */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100vh; /* Full viewport height */
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
    border-radius: 20%; /* Rounded corners */
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


  