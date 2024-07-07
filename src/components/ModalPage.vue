<template>
  <div class="modal-overlay" v-if="isVisible" @click.self="close">
    <div class="modal-content">
      <slot></slot>
      <button class="close-button" @click="close">Close</button>
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
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 25px;
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
  border-radius: 25px;
  padding: 30px;
  width: 80%;
  max-width: 500px;
  text-align: center;
  position: relative;
}

.modal-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #000;
}

.modal-content .product-input {
  margin-bottom: 20px;
}

.modal-content label {
  font-size: 16px;
  color: #000;
}

.modal-content input[type="date"] {
  display: block;
  margin: 10px auto;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.modal-content button {
  outline: none;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  border-radius: 12px;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-image: linear-gradient(135deg, #000000 10%, #000000 100%);
}

.modal-content button:hover {
  transform: scale(0.97);
}

.modal-content .close-button {
  background-color: #a82d2d;
  margin-top: 20px;
}
</style>

