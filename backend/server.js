const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require("../src/models/user/userModel.js");
const Product = require("../src/models/Product/product.js");
const routes = require('../src/router/routes');
const axios = require('axios');
//npm install nodemailer 
const nodemailer = require('nodemailer');



const app = express();
const PORT = 3000;
const EXPIRING_DATE_LIMIT = 10;
let products_will_expire = []

mongoose.set("strictQuery", false);

// Conectar a la base de datos
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

// Manejo de errores
app.use((err, req, res, next) =>
{
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Iniciar el servidor
app.listen(PORT, () =>
{
  console.log(`Server is running on http://localhost:${PORT}`);
});



function get_date_obj(expiring_date) 
{
  let parts;
  //checking for ',' and '.'
  if (expiring_date.includes(","))
  {
    parts = expiring_date.split(",");
  } else if (expiring_date.includes("."))
  {
    parts = expiring_date.split(".");
  } else
  {
    throw new Error("Unsupported date format");
  }

  //we add 0 if needed
  const day = parts[0].padStart(2, "0");
  const month = parts[1].padStart(2, "0");
  const year = parts[2];

  const date_string = `${year}-${month}-${day}`;

  return new Date(date_string);
}

function calc_days_till_expire(expiring_date)
{
  const end_date = get_date_obj(expiring_date);
  //with no parameter you get todays date
  const start_date = new Date();


  const time_diff_in_millsec = end_date - start_date;
  //converting the milliseconds to days
  const time_diff_in_days = time_diff_in_millsec / (1000 * 60 * 60 * 24);

  //we round days up
  return Math.ceil(time_diff_in_days);
}

function did_cross_expiring_limit(product)
{
  const expiring_date = product.expiring_date;
  return calc_days_till_expire(expiring_date) <= EXPIRING_DATE_LIMIT;
}

async function check_emails_to_send()
{
  //we get all users
  //for every user we get their products
  //for every product we check if it did pass the EXPIRDING_DATE_LIMIT
  //if yes, the we save that product to a list that contains all 
  //the products that the user has, that will expire soon.
  //if we done looping through the products, then we write all these products
  //when they will expire, and how many days away is that, and send 
  //an email to the representitive user

  const users = await get_users();
  emailjs.init("ct9l5Onl5LXMaeodb");

  users.forEach((user) =>
  {
    const products = user.products;
    let products_str = "";
    products.forEach((product) =>
    {
      if (did_cross_expiring_limit(product))
      {
        products_will_expire.push(product);
      }
    });

    products_will_expire.forEach((product) =>
    {
      let product_name = product.name;
      let product_expiring_date = product.expiring_date;
      let days_till_expiring = calc_days_till_expire(product.expiring_date);
      products_str += "Product Name: " + product_name + "\n";
      products_str += "Product Expiring Date: " + product_expiring_date + " which is " + days_till_expiring + " Days away!\n";
    });

    send_email(user.lastname, user.email, products_str);
    //clearing the array for the next user
    products_will_expire = [];
  });

}

async function send_email(user_name, user_email, user_products_list)
{

  let text = "Hello Mr/Ms." + user_name + "!\n\n";
  text += "We are from FoodCare Team and we found out that the following Product(s) will expire soon:\n";
  text += user_products_list + "\n\n";
  text += "Please do something about the food!\n\n";
  text += "Best regards, your FoodCare Team.";

  const mail_option =
  {
    from: 
    {
      name: "FoodCare",
      address: "foodcareteam@gmail.com" 
    },
    to: user_email,
    subject: "SOME FOOD WILL EXPIRE SOON!!",
    text: text
  };


  try
  {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth:
      {
        user: "foodcareteam@gmail.com",
        //diese pass ist von google btw 
        pass: "pkxmxlvgmgpzrait"
      },
    });
    await transporter.sendMail(mail_option);

    console.log('EMAIL WAS SUCCESSFULLY SEND!!');
  } catch (error)
  {
    console.error('WE HAD SOME GODDAMN ERROR WHILE SENDING THE EMAIL:', error);
  }
}


async function get_users()
{
  const response = await axios.get("http://localhost:3000/api/foodcare/get_users");
  const users = await response.data;
  return users;
}

async function daily_expiring_date_checks()
{
  let i = 0;
  const hour_in_milisec = 3600000;
  //ein jahr hat 8400 studnen dh, diesem loop wird nach einem jahr fertig sein
  while (i < 8400)
  {
    check_emails_to_send()

    //am ende jedes while loop wir addieren i um 1 und warten einee stunde
    i++;
    await new Promise(resolve => setTimeout(resolve, hour_in_milisec));
  }
}

/*du kannst die unten methode */
//daily_expiring_date_checks()


//testing
/* async function print_users_products(users)
{
  let i = 10;
  while (i > 0)
  {
    users.forEach((user) =>
    {
      let products = user.products;

      products.forEach((product) =>
      {
        if (this.did_cross_expiring_limit(product))
        {
          products_will_expire.push(product);
        }
      });

      let products_str = "";
      products_will_expire.forEach((product) =>
      {
        let product_name = product.name;
        let product_expiring_date = product.expiring_date;
        let days_till_expiring = this.calc_days_till_expire(product.expiring_date);

        products_str = products_str + "Product Name: " + product_name + "\n";
        products_str = products_str + "Product Expiring Date: " + product_expiring_date + " which is " + days_till_expiring + " away!\n";
      });

      //clearing the array for the next user
      products_will_expire = []
    });
    console.log("hello")
    i--;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

}
 */



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
    // Find the user by _id
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
    await database.collection("users").insertOne({
      description: request.body.newProduct
    });

    response.json(new_product);
  } catch (error)
  {
    console.error("Error adding Product:", error);
    response.status(500).send("Error server");
  }
});

/* app.delete("/api/foodcare/delete_product", (request, response) =>
{
  database.collection("products").deleteOne({
    id: request.query.id,
  });
  response.json("Delete Successful");
});
app.get("*", (req, res) =>
{
  res.sendFile(path.join(__dirname, "public", "index.html"));
}); */
