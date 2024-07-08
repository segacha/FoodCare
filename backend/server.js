const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();
const User = require("../src/models/user/userModel.js");
const Product = require("../src/models/Product/product.js");
const auto_mailing_system = require("./auto_mailing_system.js");
const ams = require("./AMS20.js");
const { stringify } = require('querystring');
const prompt = require('prompt-sync')();
const axios = require('axios');


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

// ChatGPT API, Upload der Foto
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;
  const base64Image = fs.readFileSync(imagePath).toString('base64'); // Leer y convertir a base64
  const userId = req.body.userId; // ID del usuario
  const products = req.body.products ? JSON.parse(req.body.products) : []; // Productos con fechas de caducidad

  if (!products || products.length === 0) {
    res.status(400).send('No products provided');
    fs.unlinkSync(imagePath);
    return;
  }

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
    jsonString = jsonString.replace(/```json\n/, '').replace(/\n```/, ''); // Filtrar el archivo JSON
    const jsonData = JSON.parse(jsonString);

    if (Array.isArray(jsonData.items)) {
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).send('Usuario no encontrado');
        return;
      }

      const productPromises = jsonData.items.map(async (item, index) => {
        const newProduct = new Product({
          name: item.name,
          preis: item.price,
          expiring_date: products[index].expiring_date,
        });

        await newProduct.save();
        user.products.push(newProduct._id);
        return newProduct;
      });

      await Promise.all(productPromises);
      await user.save();

      res.send('Todos los productos se han guardado correctamente.');
    } else {
      res.status(400).send('Datos inválidos: se esperaba un array');
    }
  } catch (error) {
    console.error('Error processing image:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    fs.unlinkSync(imagePath);
  }
});


app.post('/api/process_image', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;
  const base64Image = fs.readFileSync(imagePath).toString('base64'); 

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Return JSON document with data. Only return JSON not other text. Give only items as array in the JSON in which each items has a name. Give me the total amount of money that the bill has cost as total amount of money." },
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
    jsonString = jsonString.replace(/```json\n/, '').replace(/\n```/, ''); // Filtrar el archivo JSON
    const jsonData = JSON.parse(jsonString);

    if (jsonData.total) {
      const totalAmount = jsonData.total; // Direkter Zugriff auf die Gesamtsumme
      const purchaseDate = new Date();
      const monthIndex = purchaseDate.getMonth();

      await User.findByIdAndUpdate(userId, {
        $inc: { [`monthlyExpenses.${monthIndex}`]: totalAmount }
      });

      console.log(`Total amount ${totalAmount} added to month ${monthIndex + 1}`);

      res.send('Total amount added to the monthly expenses.');
    } else {
      console.error('jsonData does not contain total amount');
      res.status(400).send('Invalid data: total amount not found');
    }

    res.json(jsonData);
  } catch (error) {
    console.error('Error processing image:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    fs.unlinkSync(imagePath); // Borrar la foto después de usarla
  }
});

// Agregar las rutas para manejar la lista de compras
app.get('/api/user/:userId/shopping-list', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user.shoppingList);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/api/user/:userId/shopping-list', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    user.shoppingList = req.body.shoppingList;
    await user.save();
    res.send('Shopping list saved');
  } catch (error) {
    console.error('Error saving shopping list:', error); // Agregar este log
    res.status(500).send('Server error');
  }
});

app.delete('/api/user/:userId/shopping-list/:itemId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const itemId = req.params.itemId;
    user.shoppingList = user.shoppingList.filter(item => item._id.toString() !== itemId);

    await user.save();
    res.send('Item removed from shopping list');
  } catch (error) {
    console.error('Error removing item from shopping list:', error);
    res.status(500).send('Server error');
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

//GET USER BY EMAIL
app.get('/api/foodcare/get_user_by_email/:user_email', async (req, res) =>
{
  const email = req.params.user_email;
  try
  {
    //Fetch products by products IDs 
    const user = await User.findOne({ "email": email }).populate('products').exec();
    if (!user)
    {
      return res.status(404).send('We couldn\'t find a user with the given ID!');
    }
    res.send({ status: true, msg: "User validated successfully", user })

  } catch (error)
  {
    console.error('Here was some kind error getting the user:', error);
    res.status(500).send('Internal Server Error');
  }
});

//einen beispiel wie man diesem api, in der test() func zu sehen.
app.delete('/api/foodcare/delete_product/', async (req, res) =>
{
  //console.log("body is: " + req)
  //const email = req.body.user_email;
  try
  {
    //Fetch products by products IDs 
    const product = await Product.findByIdAndDelete(req.body._id);
    if (!product)
    {
      console.error("we couldnt fine the product...");
      res.status(404).send('product not found!');
    }
    console.log("the deleted product name is: " + product.name)

    res.send({ status: true, msg: "product is successfully deleted" })
    console.log("PRODUCT GOT DELTED")

  } catch (error)
  {
    console.error('there was some error while deleting a product:\n', error);
    res.status(500).send('Internal Server Error');
  }
});

test();
async function test()
{
  const product =//668559319647b2b1e799027f
  {
    name: "one month food",
    preis: "99,99",
    expiring_date: "02.08.2024",
    receiving_date: "month",
    email_receiving_date: null
  };
  const product2 =//668558c1f169860cab23c9c4
  {
    name: "one week food",
    preis: "99,99",
    expiring_date: "10.07.2024",
    receiving_date: "week",
    email_receiving_date: null
  };

  const product3 =//668558f2f9e185ccf74990cd
  {
    name: "three days food",
    preis: "99,99",
    expiring_date: "06.07.2024",
    receiving_date: "three_days",
    email_receiving_date: null
  };

  /**so sollte einen produkt spaeter im fortend gespeichert */

  /**ich glaube wir sollen 'get_date_object' in fortend implementieren */
  //date_obj = ams.get_date_obj(product.expiring_date);
  //product.email_receiving_date = new Date(date_obj);

  /**hier wir haben "-30" weil der user 30 tage vor der datumablauf einen email bekommen
   * hatte er 'eine woche davor' ausgeaehlt, dann sollte "-7"
   * und wenn drei tage davor dann sollte "-3"
   */
  //product.email_receiving_date.setDate(date_obj.getDate() - 30);
  //console.log("date product rechieving date = " + (product.email_receiving_date));

  /**fuer testing habe ich diesem user ausgesucht, um die produkt bei ihm zu speichern */
  //const user = await User.findById("665f19bf26c24abf3956b267").exec();
  //if (!user)
  //{
  //  return res.status(404).send('We couldn\'t find a user with this ID!');
  //}

  /**prodkte in DB speichern */
  //const new_product = new Product(product);
  //await new_product.save();
  //console.log("we add a new prodcut to the db: " + new_product._id);
  //
  //user.products.push(new_product._id);
  //await user.save();
  //console.log("the product is added to the user!")

  /**loeschen einen produkt */
  /* const product = await Product.findById("6668543f02160a5e9317affe");
  if (!product)
  {
    console.log("we didnt find the product..");
    return;
  }
  const response = await axios.delete("http://localhost:3000/api/foodcare/delete_product", { data: product });
 */
}

//GET USER LOGIN
app.get('/api/foodcare/login/', async (req, res) => {

  const key = "123456789trytryrtry";
  const encryptor = require("simple-encryptor")(key);
  const email = req.params.user_email;
  try {
    const user = await User.findOne({ email }).populate('products').exec();
    const password = user.password;
    if (!user) {
      return res.status(404).send('We couldn\'t find a user with the given email!');
    }
    const decryptedPassword = encryptor.decrypt(user.password);
    if (decryptedPassword === password) {
      res.send({ status: true, msg: "User validated successfully", user });
    } else {
      res.status(401).send('Invalid password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

//GET PRODUCT BY USE ID
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
//auto_mailing_system.daily_expiring_date_checks();
ams.daily_expiring_date_checks();

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
