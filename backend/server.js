const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();
const User = require("../src/models/user/userModel.js");
const Product = require("../src/models/Product/product.js");
const ams = require("./AMS20.js");
const encryptor = require("simple-encryptor")(process.env.ENCRYPTION_KEY);


const app = express();
const PORT = 3000;
mongoose.set("strictQuery", false);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// MongoDB Connection
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

// Multer helps to process the image.
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

// POST Products with expiring dates
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;
  const userId = req.body.userId;
  const products = req.body.products ? JSON.parse(req.body.products) : [];
  const totalAmount = parseFloat(req.body.total_amount);

  console.log('Received totalAmount:', totalAmount);

  if (!products || products.length === 0) {
    res.status(400).send('No products provided');
    fs.unlinkSync(imagePath);
    return;
  }

  if (isNaN(totalAmount)) {
    res.status(400).send('No valid total amount provided');
    fs.unlinkSync(imagePath);
    return;
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).send('User not found');
      fs.unlinkSync(imagePath);
      return;
    }

    const currentMonth = new Date().getMonth(); // Use zero-based index for months (0 = January, 11 = December)

    console.log('Current Month Index:', currentMonth);

    // Ensure monthlyTotals array exists and has 12 elements
    if (!user.monthlyTotals || user.monthlyTotals.length !== 12) {
      user.monthlyTotals = Array(12).fill(0);
    }

    user.monthlyTotals[currentMonth] += totalAmount;

    console.log('Updated monthlyTotals:', user.monthlyTotals);

    const productPromises = products.map(async (item) => {
      const newProduct = new Product({
        name: item.name,
        preis: item.price,
        expiring_date: item.expiring_date
      });

      await newProduct.save();
      user.products.push(newProduct._id);
      return newProduct;
    });

    await Promise.all(productPromises);
    await user.save();

    res.send('Todos los productos y el total de la factura se han guardado correctamente.');
  } catch (error) {
    console.error('Error processing image:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    fs.unlinkSync(imagePath);
  }
});

// ChatGPT API, Process of the Image
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
            { type: "text", text: "Return JSON document with data. Only return JSON not other text. Give only items as array in the JSON in which each items has a name and give me the total_amount of the bill."},
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
    jsonString = jsonString.replace(/```json\n/, '').replace(/\n```/, ''); //Filter the JSON response
    const jsonData = JSON.parse(jsonString);

    res.json(jsonData);
  } catch (error) {
    console.error('Error processing image:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    fs.unlinkSync(imagePath); // Delete the Image after using it
  }
});

//GET Expenses of the month
app.get('/api/user/:userId/monthly-totals', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user.monthlyTotals);
  } catch (error) {
    console.error('Error fetching monthly totals:', error);
    res.status(500).send('Server error');
  }
});

// GET User Shopping List
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

// POST Shopping List
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
    console.error('Error saving shopping list:', error);
    res.status(500).send('Server error');
  }
});

//DELETE Item in the Shopping List
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

//DELETE PRODUCT
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
    console.log("PRODUCT GOT DELETED")

  } catch (error)
  {
    console.error('there was some error while deleting a product:\n', error);
    res.status(500).send('Internal Server Error');
  }
});

//UPDATE DATE TO GET RECEIVE MAIL
app.put('/api/foodcare/update_products/', async (req, res) =>
  {
    try
    {
      const products = req.body;
      console.log("the prod are: " + JSON.stringify(products));
      const updated_products = await Promise.all(
        products.data.map(async (product) => {
          return await Product.findByIdAndUpdate(product._id, { email_receiving_date: product.email_receiving_date, receiving_date: product.receiving_date }, { new: true });//true only to give the updated products.
        })
      );
      console.log("products are updated now!")
      res.json(updated_products)
      // updatedDocs would contain the updated documents
      } catch (error)
    {
      console.error('es gab problemen als wir die produkten update machen wollten:\n', error);
      res.status(500).send('Internal Server Error');
    }
});

//POST USER LOGIN
app.post('/api/foodcare/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res.status(404).send('User not found');
    }

    const decryptedPassword = encryptor.decrypt(user.password);

    if (decryptedPassword === password) {
      res.send({ status: true, user });
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

//AMS checking the expiring date of all the Products
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
