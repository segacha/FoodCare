const express = require('express');
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const path = require('path');

const app = express();
app.use(cors());

const CONNECTION_STRING = "mongodb+srv://foodcare:webtech2@foodcare.gygzrc9.mongodb.net/?retryWrites=true&w=majority&appName=FoodCare";
const DATABASE_NAME = "foodcaredb";

let database;

app.listen(3000, async () => {
    try {
        const client = await MongoClient.connect(CONNECTION_STRING);
        database = client.db(DATABASE_NAME);
        console.log("MongoDB Connection granted");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
});

app.get('/api/foodcare/GetProducts', async (request, response) => {
    try {
        const result = await database.collection("products").find({}).toArray();
        response.send(result);
    } catch (error) {
        console.error("Error fetching products:", error);
        response.status(500).send("Internal Server Error");
    }
});

app.post("/api/foodcare/AddProduct", multer().none(), async (request, response) => {
    try {
        
        const numOfDocs = await database.collection("products").countDocuments();
        await database.collection("products").insertOne({
            id: (numOfDocs + 1).toString(),
            description: request.body.newProduct
        });

        response.json("Product Added");
    } catch (error) {
        console.error("Error adding Products:", error);
        response.status(500).send("Error server");
    }
});

app.delete("/api/foodcare/DeleteProduct",(request, response)=> {
    database.collection("products").deleteOne({
        id:request.query.id        
    })
    response.json("Delete Successful")
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


