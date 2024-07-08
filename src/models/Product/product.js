const mongoose = require('mongoose');

// Define the schema for the User collection
const product_schema = new mongoose.Schema({
    name: {type: String, required: true},
    preis: {type: String},
    expiring_date: {type: String},
    email_receiving_date: {type: Date, default: Date()},
    receiving_date: {type: String},
    num_of_received_emails: {type: Number, default: 0}
});

// Define the User model and export it
const product = mongoose.model('product', product_schema,'Products');
module.exports = product;