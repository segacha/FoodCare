<template>
  <div class="modal-overlay" v-if="isVisible" @click.self="close">
    <div class="modal-content">
      <h2>Set Expiry Dates for Products</h2>
      <div v-for="(product, index) in products" :key="index" class="product-input">
        <label>{{ product.name }}: </label>
        <input type="date" v-model="product.expiring_date" placeholder="Enter expiring date" />
        <button class="delete-button" @click="removeProduct(index)">Delete</button>
      </div>
      <button class="confirm-button" @click="confirmExpiryDates">Confirm</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalPage',
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    products: {
      type: Array,
      required: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    removeProduct(index) {
      this.$emit('remove-product', index);
    },
    confirmExpiryDates() {
      this.$emit('confirm');
    }
  }
};
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgb(255, 255, 255);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border-radius: 25px;
  padding: 30px;
  width: 80%;
  max-width: 500px;
  max-height: 40vh;
  overflow-y: auto;
  text-align: center;
  position: relative;
}

.modal-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #000000;
}

.modal-content .product-input {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-content label {
  font-size: 16px;
  color: #000;
  margin-right: 10px;
  flex: 1;
}

.modal-content input[type="date"] {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  flex: 1;
}

.confirm-button {
  outline: none;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  border-radius: 12px;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #a9c05c 10%, #2da852 100%);
  height: 35px;
  width: 100px;
}

.confirm-button:hover {
  transform: scale(0.97);
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
</style>

