import { reactive } from 'vue';

export const store = reactive({
  user: JSON.parse(localStorage.getItem('user')) || null,
  products: [],
  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  setProducts(products) {
    this.products = products;
  }
});
