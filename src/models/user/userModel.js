const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, //ref ist die obergen produkt
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }]
},{
  collection: 'users' // Especificar la colección
});

const User = mongoose.model('User', userSchema);

module.exports = User;