const Product = require("../src/models/Product/product.js");
const axios = require('axios');
const ics_management = require('../backend/ics_management.js');
const path = require('path');
const nodemailer = require('nodemailer');

const EXPIRING_DATE_LIMIT = 400;
const MAXIMUM_EMAILS_PER_PRODUCT = 2; //200
const EMAILS_TIME_DIFF = Math.ceil(EXPIRING_DATE_LIMIT / MAXIMUM_EMAILS_PER_PRODUCT);
let products_will_expire = []


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

  //wir gucken ob day bei den eingegebenen expiring date hat die groesse 2
  //wenn nicht, dann wir sollen '0' am anfang addieren
  const day = parts[0].padStart(2, "0");
  const month = parts[1].padStart(2, "0");
  //angenommen, dass gegebene datum ist: 15,01,24
  //dann wir sollen '20' bei 24 addieren um '2024' zu haben
  const year = parts[2].padStart(4, "20");

  const date_string = `${year}-${month}-${day}`;
  if (day > 31 || month > 12)
  {
    console.log(expiring_date)
    throw new Error('du hast ungueltige Datum eingegeben');
  }
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

  for (const user of users)
  {
    const products = user.products;
    let products_str = "";
    //check sending conditions
    for (const product of products)
    {
      let should_be_sent = await should_user_get_email(product);
      if (did_cross_expiring_limit(product) && should_be_sent)
      {
        products_will_expire.push(product);
      }
    }

    products_will_expire.forEach((product) =>
    {
      let product_name = product.name;
      let product_expiring_date = product.expiring_date;
      let days_till_expiring = calc_days_till_expire(product.expiring_date);
      products_str += "Product Name: " + product_name + "\n";
      products_str += "Product Expiring Date: " + product_expiring_date + " which is " + days_till_expiring + " Days away!\n";
    });

    //this means, if the user has one (or more) products that will expire
    //then we should send him an email!
    if (products_will_expire.length >= 1)
    {
      send_email(user, products_str);
    }

    //clearing the array for the next user
    products_will_expire = [];
  }

}

async function send_email(user, user_products_list)
{
  const user_name = user.lastname;
  const user_email = user.email;
  const user_id = user._id;

  let text = "Hello Mr/Ms. " + user_name + "!\n\n";
  text += "We are from FoodCare Team and we found out that the following Product(s) will expire soon:\n";
  text += user_products_list + "\n\n";
  text += "Please do something about the food!\n\n";
  text += "Best regards, your FoodCare Team.";

  //erzeugen produkte und den entsprechended ics_file
  const products = await get_user_products(user_id);
  await ics_management.make_ics_file(products);
  //we need to add attachment aka the events.ics
  const mail_option =
  {
    from:
    {
      name: "FoodCare",
      address: "foodcareteam@gmail.com"
    },
    to: user_email,
    subject: "Product(s) will expire soon!!",
    text: text,
    attachments:
      [
        {
          filename: "events.ics",
          path: path.join(__dirname, "events.ics")
        }
      ]
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

    //we delte the file after we send it in the email
    await ics_management.delete_ics_file();

    console.log('EMAIL WAS SUCCESSFULLY SEND!!');
  } catch (error)
  {
    console.error('WE HAD SOME GODDAMN ERROR WHILE SENDING THE EMAIL:', error);
  }
}

//diese funktion checkt alle moegliche faelle einen product haben kann bei der sendung einer Email
//und versucht das zu steuern in dem wir emails senden nur dann wenn product in bestimmte phasen ist.
//zb EXPIRDING_DATE_LIMIT = 30. und wir wollen innerhalb diesen 30 Tage 3 emails senden um den user zu erinnern
//dann wir verteilen die emails auf drei phasen. jeder phase is 10 Tage lang (weil 30/3 = 10).
//unten versuchte ich alle moegliche faelle zu catching und zu behandeln
async function should_user_get_email(product)
{
  const days_till_expiring = calc_days_till_expire(product.expiring_date);
  let j = MAXIMUM_EMAILS_PER_PRODUCT;
  let emails_num = product.num_of_received_emails;
  let x = j - 1;

  for (let i = 0; i < MAXIMUM_EMAILS_PER_PRODUCT; i++) 
  {
    //400 / 2 = 200
    //400-200/200-0
    //wir schauen ob days_till_expiring die EMAILS_TIME_DIFF steht.
    //wenn ja, wir gucken ob es gleich 'i' ist (das heißt einen email muss geschick werden)
    //wir machen update zu der product und geben true zureuck, dass 'ja, wir sollen email schicken'
    if (((x * EMAILS_TIME_DIFF) < days_till_expiring && days_till_expiring < (j * EMAILS_TIME_DIFF)) && emails_num == i)
    {
      const db_product = await Product.findById(product._id).exec();
      db_product.num_of_received_emails = emails_num + 1;
      await db_product.save();
      return true;
    }
    //wenn einen product hier kommt, heisst es, dass wir haben schon einen email geschickt in diesem phase
    //und bauchen kein neuen zu schicken
    else if ((x * EMAILS_TIME_DIFF) < days_till_expiring && days_till_expiring < (j * EMAILS_TIME_DIFF))
    {
      return false;
    }
    //hier ist fuer den fall wenn einen product in spaetren phasen, aber hat keinen emails frueher geschickt
    //deswegen, versuchen wir das auszugleichen oder zu balancieren
    else if (emails_num == i)
    {
      const db_product = await Product.findById(product._id).exec();
      db_product.num_of_received_emails = emails_num + 1;
      await db_product.save();
      emails_num = db_product.num_of_received_emails
    }
    j--;
    x--;
  }
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

async function get_users()
{
  const response = await axios.get("http://localhost:3000/api/foodcare/get_users");
  const users = await response.data;
  return users;
}

async function get_user_products(user_id)
{
  const url_str = "http://localhost:3000/api/foodcare/get_products/" + user_id;
  const response = await axios.get(url_str);
  const products = await response.data;
  return products;
}

module.exports = { daily_expiring_date_checks, get_date_obj };
