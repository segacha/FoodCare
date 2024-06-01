const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require("../src/models/user/userModel.js");
const Product = require("../src/models/Product/product.js");
const routes = require('../src/router/routes');
const auto_mailing_system = require("./auto_mailing_system.js");


const app = express();
const PORT = 3000;
mongoose.set("strictQuery", false);

// Connect to Database
mongoose
  .connect(
    "mongodb+srv://foodcare:webtech2@foodcare.gygzrc9.mongodb.net/foodcaredb",
    {
      useNewUrlParser: true,
    }
  )
  .then(() =>
  {
    console.log("Database Connected Successfully");
  })
  .catch((error) =>
  {
    console.error("Database cannot be Connected", error);
  });

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api", routes);

// Ruta base para verificar que el servidor está funcionando
app.get("/", (req, res) =>
{
  res.send("Server is running");
});

// Error Handeling
app.use((err, req, res, next) =>
{
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//Start server
app.listen(PORT, () =>
{
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/api/foodcare/get_users', async (request, response) =>
{
  try 
  {
    //papulate um die tatsaechliche produkte zu haben und nicht ihre IDs
    const users = await User.find().populate("products").exec();
    response.json(users)
  } catch (error)
  {
    console.error('there was some error gettng the users:', error);
  }
});

//bekommen einen user mit id
app.get('/api/foodcare/get_user/:userId', async (req, res) =>
{
  const { userId } = req.params;
  try
  {
    //und nochmal papulate um die tatsaechliche produkte zu haben und nicht ihre IDs
    const user = await User.findById(userId).populate('products').exec();
    if (!user)
    {
      return res.status(404).send('We couldn\'t find a user with the given ID!');
    }
    res.json(user);
  } catch (error)
  {
    console.error('ehere was some kind error getting the user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/foodcare/get_products/:userId', async (request, response) =>
{
  const { userId } = request.params;
  try 
  {
    //we get the user with the given ID
    //mit populate() werden wir die tatsaechliche produkte bekommen und nicht ihre IDs
    //die eingabe "products" bezieht sich auf das attribut "products" von user 
    //exec() um to exicute the query
    const user = await User.findById(userId).populate('products').exec();
    if (!user)
    {
      return response.status(404).send('we couldnt find a user with this id!');
    }

    response.send(user.products);
  } catch (error)
  {
    console.error('Error fetching user products:', error);
    response.status(500).send('Internal Server Error');
  }
});

app.post('/api/foodcare/add_product/:userId', async (req, res) =>
{
  const { userId } = req.params;

  try
  {
    //find the user by _id
    const user = await User.findById(userId).exec();

    if (!user)
    {
      return res.status(404).send('we couldnt find a user with this id!');
    }

    //we make new produc and save it to the collection in the db
    const new_product = new Product(req.body);
    await new_product.save();

    //wir speicher den neuen produkt id in die products array
    //der user, damit wir das spaeter anrufen koennen
    user.products.push(new_product._id);
    await user.save();
    res.json(new_product);
  } catch (error)
  {
    console.error("Error adding Product:", error);
    response.status(500).send("Error server");
  }
});

/*du kannst die unten methode auskommentieren wenn du den AMS an machen moechtest*/
auto_mailing_system.daily_expiring_date_checks()
