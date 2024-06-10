const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();
const Response = require('../src/models/response.js'); 
const User = require("../src/models/user/userModel.js");
const Product = require("../src/models/Product/product.js");
const auto_mailing_system = require("./auto_mailing_system.js");
const { stringify } = require('querystring');
const prompt = require('prompt-sync')();

const app = express();
const PORT = 3000;
mongoose.set("strictQuery", false);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//MongoDB Connection
mongoose
  .connect("mongodb+srv://foodcare:webtech2@foodcare.gygzrc9.mongodb.net/foodcaredb", {
  })
  .then(() =>
  {
    console.log("Database Connected Successfully");
  })
  .catch((error) =>
  {
    console.error("Database cannot be Connected", error);
  });

// Multer bearbeitet das Upload von dem Foto
const storage = multer.diskStorage({
  destination: function (req, file, cb)
  {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb)
  {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middlewares
app.use(cors());
app.use(express.json());

// Server Check
app.get("/", (req, res) =>
{
  res.send("Server is running");
});

// ChatGPT API, Upload und Bearbeitung der Foto
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path; 
  const base64Image = fs.readFileSync(imagePath).toString('base64'); // Lesen und Umwandeln in base64
  const userId = req.body.userId; // ID abgabe

  try
  {
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
    jsonString = jsonString.replace(/```json\n/, '').replace(/\n```/, ''); //JSON file wurde gefiltert
    const jsonData = JSON.parse(jsonString); 

    if (Array.isArray(jsonData.items)) {  
      const user = await User.findById(userId);

      if (!user)
      {
        res.status(404).send('Usuario no encontrado');
        return;
      }

      const productPromises = jsonData.items.map(async (item) => {
        const expiring_date = prompt("Write the expiring date of this product: " + item.name+" ");
        const newProduct = new Product({
          name: item.name,
          preis: item.price,
          expiring_date: expiring_date
        });

        await newProduct.save();
        user.products.push(newProduct._id);
        return newProduct;
      });

      await Promise.all(productPromises);
      await user.save();

      res.send('Todos los productos se han guardado correctamente.');
    } else
    {
      res.status(400).send('Datos inválidos: se esperaba un array');
    }


  } catch (error)
  {
    console.error('Error processing image:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    fs.unlinkSync(imagePath); //Delete Foto after used
  }
});


// GET USERS
app.get('/api/foodcare/get_users', async (req, res) =>
{
  try
  {
    const users = await User.find().populate("products").exec();
    res.json(users);
  } catch (error)
  {
    console.error('There was some error getting the users:', error);
    res.status(500).send('Internal Server Error');
  }
});

//GET USER BY ID
app.get('/api/foodcare/get_user/:userId', async (req, res) =>
{
  const { userId } = req.params;
  try
  {
    const user = await User.findById(userId).populate('products').exec();
    if (!user)
    {
      return res.status(404).send('We couldn\'t find a user with the given ID!');
    }
    res.json(user);
  } catch (error)
  {
    console.error('There was some kind of error getting the user:', error);
    res.status(500).send('Internal Server Error');
  }
});

//CREATE USER
app.post('/api/foodcare/create_user/', async (req, res) =>
{
  
  const key = "123456789trytryrtry";
  const encryptor = require("simple-encryptor")(key);
  console.log("we are in the create user");
  console.log("req is: " + req.body.firstname)
  try
  {
    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: encryptor.encrypt(req.body.password),
    });

    await user.save();
    res.send({status:true, user} )
  } catch (error)
  {
    console.error("Error creating user:\n", error);
    return false;
  }
});

app.get('/api/foodcare/get_user_by_email/:user_email', async (req, res) =>
{
  const email = req.params.user_email;
  try
  {
    //und nochmal papulate um die tatsaechliche produkte zu haben und nicht ihre IDs
    const user = await User.findOne({ "email": email }).populate('products').exec();
    console.log("we are in the get by email, and products are: " + user.products);
    if (!user)
    {
      return res.status(404).send('We couldn\'t find a user with the given ID!');
    }
    res.send({ status: true, msg: "User validated successfully", user })

  } catch (error)
  {
    console.error('ehere was some kind error getting the user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Ruta para obtener productos de un usuario
app.get('/api/foodcare/get_products/:userId', async (req, res) =>
{
  const { userId } = req.params;
  try
  {
    const user = await User.findById(userId).populate('products').exec();
    if (!user)
    {
      return res.status(404).send('We couldn\'t find a user with this ID!');
    }
    res.json(user.products);
  } catch (error)
  {
    console.error('Error fetching user products:', error);
    res.status(500).send('Internal Server Error');
  }
});

//ADD PRODUCT TO USER BY ID
app.post('/api/foodcare/add_product/:userId', async (req, res) =>
{
  const { userId } = req.params;
  try
  {
    const user = await User.findById(userId).exec();
    if (!user)
    {
      return res.status(404).send('We couldn\'t find a user with this ID!');
    }

    const new_product = new Product(req.body);
    await new_product.save();

    user.products.push(new_product._id);
    await user.save();
    res.json(new_product);
  } catch (error)
  {
    console.error("Error adding Product:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Automating mail system checking the expiring date of all the Products
auto_mailing_system.daily_expiring_date_checks();

//Error Handling
app.use((err, req, res, next) =>
{
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//Start Server
app.listen(PORT, () =>
{
  console.log(`Server is running on http://localhost:${PORT}`);
});

//TEST
async function delete_garbge_products()
{
  try
  {
    await Product.deleteMany({ expiring_date: '' });
    console.log('Products with empty expiring_date deleted successfully');
  } catch (err)
  {
    console.error(err);
  }

}
