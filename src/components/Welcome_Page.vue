<template>
  <body>
    <header>
      <nav class="navbar">
        <div class="logo">
          <a href="">FoodCare</a>
        </div>
        <ul class="menu">
          <li><a href="#">Home</a></li>
          <li><a href="#">Service</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <div class="buttons">
          <input type="button" value="Login" @click="goToLogin" />
          <input type="button" value="Register" @click="goToLogin" />
        </div>
      </nav>
      <div class="text-content">
        <img src="../assets/logo.png" alt="">
        <div class = "text-info">
          <h1>Your Food,<br>Your Future!</h1>
          <p>
            FoodCare helps you find and manage fresh groceries easily. On this page, 
            you can view supermarket products, upload them as images
            and keep track of your favorite products so they don't go to waste. 
            Welcome to a simpler way to care for your food!
          </p>
        </div>
      </div>
    </header>
  </body>
</template>

<script>
export default {
  methods: {
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rubik+Mono+One&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Rubik, sans-serif;
}

body{
  height: 100vh;
  width: 100%;
  display: flex;
  background-image: linear-gradient(135deg, #a9c05c 20%, #2da852 100%);
  justify-content: center;
  align-items: center;
}

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

.navbar img {
  height: 100px;
  width: 120px;
  align-self: left;
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
  background-image: linear-gradient(135deg, #a9c05c 10%, #2da852 100%);
}

.navbar .buttons input:hover {
  transform: scale(0.97);
}

header .text-content {
  margin: 65px 0 0 50px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.text-content img {
  height: auto;
  width: 100%;
  max-width: 300px;
  margin-right: 20px;
}

.text-content .text-info {
  width: 100%;
  max-width: 500px;
  margin-top: 20px;
}

.text-content .text-info h2 {
  font-size: 27px;
  font-weight: 600;
}

.text-content .text-info p {
  font-size: 15px;
  margin-top: 10px;
}

/* Media for Responsive Design */
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

  header .text-content {
    margin: auto;
    width: 70%;
    width: 100%; 
    justify-content: center; 
    text-align: center; 
  }

  .text-content .text-info {
    width: 100%;
    max-width: 500px;
    margin-top: 20px;
    justify-content: center; 
    text-align: center; 
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

  header .text-content {
    margin: 20px 10px;
  }

  header .text-content h2 {
    font-size: 18px;
  }

  .text-content .text-info p {
    font-size: 13px;
  }

}
</style>
