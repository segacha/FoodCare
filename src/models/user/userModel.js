const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, //ref ist die obergen produkt
  data: { type: mongoose.Schema.Types.Mixed, ref: 'data' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
  shoppingList: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true }
  }]
},{
  collection: 'users' // Especificar la colección
});

const User = mongoose.model('User', userSchema);

module.exports = User;