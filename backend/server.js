const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config(); // Asegúrate de tener un archivo .env con las variables de entorno necesarias
const Response = require('../src/models/response.js'); // Asegúrate de que la ruta sea correcta
const User = require("../src/models/user/userModel.js");
const Product = require("../src/models/Product/product.js");
const auto_mailing_system = require("./auto_mailing_system.js");
const prompt = require('prompt-sync')();

const app = express();
const PORT = 3000;
mongoose.set("strictQuery", false);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Conectar a la base de datos de MongoDB
mongoose
  .connect("mongodb+srv://foodcare:webtech2@foodcare.gygzrc9.mongodb.net/foodcaredb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((error) => {
    console.error("Database cannot be Connected", error);
  });

// Configurar multer para manejar la carga de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middlewares
app.use(cors());
app.use(express.json());
/* app.use("/api", routes);
 */
// Ruta base para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Ruta para manejar la carga y procesamiento de imágenes
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path; // Ruta de la imagen cargada
  const base64Image = fs.readFileSync(imagePath).toString('base64'); // Leer y convertir la imagen a base64

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Return JSON document with data. Only return JSON not other text. Give only items as array in the JSON in which each items has a name, price." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "low"
              },
            },
          ],
        },
      ],
    });

    let jsonString = response.choices[0].message.content;
    jsonString = jsonString.replace(/```json\n/, '').replace(/\n```/, ''); // Limpiar el formato JSON
    const jsonData = JSON.parse(jsonString); // Parsear la respuesta JSON

    if (Array.isArray(jsonData.items)) {  // Asegurarse de que jsonData es un array
      jsonData.items.forEach(async (item) => {
        const expiring_date = prompt("Write the expiring date of this product: " + item.name)
        const newProduct = new Product({
          name: item.name, // Asegúrate de que jsonData tiene estos campos
          preis: item.price,
          expiring_date: expiring_date
        });

        try {
          await newProduct.save();
          console.log('Producto guardado:', newProduct);
        } catch (error) {
          console.error('Error guardando producto:', error);
        }
      });
    } else {
      console.error('jsonData no es un array');
      res.status(400).send('Datos inválidos: se esperaba un array');
      return;
    }

    res.send('Todos los productos se han guardado correctamente.');
  } catch (error) {
    console.error('Error processing image:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    fs.unlinkSync(imagePath); // Eliminar la imagen después de procesarla
  }
});

// Ruta para obtener usuarios
app.get('/api/foodcare/get_users', async (req, res) => {
  try {
    const users = await User.find().populate("products").exec();
    res.json(users);
  } catch (error) {
    console.error('There was some error getting the users:', error);
    res.status(500).send('Internal Server Error');
  }
});

//bekommen einen user mit id
app.get('/api/foodcare/get_user/:userId', async (req, res) =>
{ 
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('products').exec();
    if (!user) {
      return res.status(404).send('We couldn\'t find a user with the given ID!');
    }
    res.json(user);
  } catch (error) {
    console.error('There was some kind of error getting the user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/foodcare/create_user/', async (req, res) =>
{
  const key = "123456789trytryrtry";
  const encryptor = require("simple-encryptor")(key);
  console.log("we are in the create user")
  try
  {
    const user = new User({
      firstname: req.firstname,
      lastname: req.lastname,
      email: req.email,
      password: encryptor.encrypt(req.password),
    });

    await user.save();
    res.json(user);
  } catch (error)
  {
    console.error("Error creating user:", error);
    return false;
  }
});

app.get('/api/foodcare/get_user_by_email/:user_email', async (req, res) =>
{
  const email = req.params.user_email;
  try
  {
    //und nochmal papulate um die tatsaechliche produkte zu haben und nicht ihre IDs
    const user = await User.findOne({"email": email}).populate('products').exec();
    if (!user)
    {
      return res.status(404).send('We couldn\'t find a user with the given ID!');
    }
    res.send({status: true, msg:"User validated successfully", user})
    
  } catch (error)
  {
    console.error('ehere was some kind error getting the user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/foodcare/create_user/', async (req, res) =>
{
  const key = "123456789trytryrtry";
  const encryptor = require("simple-encryptor")(key);
  console.log("we are in the create user")
  try
  {
    const user = new User({
      firstname: req.firstname,
      lastname: req.lastname,
      email: req.email,
      password: encryptor.encrypt(req.password),
    });

    await user.save();
    res.json(user);
  } catch (error)
  {
    console.error("Error creating user:", error);
    return false;
  }
});

app.get('/api/foodcare/get_user_by_email/:user_email', async (req, res) =>
{
  const email = req.params.user_email;
  try
  {
    //und nochmal papulate um die tatsaechliche produkte zu haben und nicht ihre IDs
    const user = await User.findOne({"email": email}).populate('products').exec();
    console.log("we are in the get by email, and products are: " + user.products);
    if (!user)
    {
      return res.status(404).send('We couldn\'t find a user with the given ID!');
    }
    res.send({status: true, msg:"User validated successfully", user})
    
  } catch (error)
  {
    console.error('ehere was some kind error getting the user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Ruta para obtener productos de un usuario
app.get('/api/foodcare/get_products/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('products').exec();
    if (!user) {
      return res.status(404).send('We couldn\'t find a user with this ID!');
    }
    res.json(user.products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Ruta para agregar un nuevo producto
app.post('/api/foodcare/add_product/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).send('We couldn\'t find a user with this ID!');
    }

    const new_product = new Product(req.body);
    await new_product.save();

    user.products.push(new_product._id);
    await user.save();
    res.json(new_product);
  } catch (error) {
    console.error("Error adding Product:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Ejecución del sistema de correos automáticos
auto_mailing_system.daily_expiring_date_checks();

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
