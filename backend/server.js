const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('../src/router/routes');

const app = express();
const PORT = 3000;

mongoose.set("strictQuery", false);

// Conectar a la base de datos
mongoose.connect("mongodb+srv://foodcare:webtech2@foodcare.gygzrc9.mongodb.net/foodcaredb", {
    useNewUrlParser: true
})
.then(() => {
    console.log("Database Connected Successfully");
})
.catch((error) => {
    console.error("Database cannot be Connected", error);
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Ruta base para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// app.get('/api/foodcare/GetProducts', async (request, response) => {
//     try {
//         const result = await database.collection("products").find({}).toArray();
//         response.send(result);
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         response.status(500).send("Internal Server Error");
//     }
// });

// app.post("/api/foodcare/AddProduct", multer().none(), async (request, response) => {
//     try {
        
//         const numOfDocs = await database.collection("products").countDocuments();
//         await database.collection("products").insertOne({
//             id: (numOfDocs + 1).toString(),
//             description: request.body.newProduct
//         });

//         response.json("Product Added");
//     } catch (error) {
//         console.error("Error adding Products:", error);
//         response.status(500).send("Error server");
//     }
// });

// app.delete("/api/foodcare/DeleteProduct",(request, response)=> {
//     database.collection("products").deleteOne({
//         id:request.query.id        
//     })
//     response.json("Delete Successful")
// });

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


