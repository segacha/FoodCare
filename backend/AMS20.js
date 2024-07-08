const Product = require("../src/models/Product/product.js");
const User = require("../src/models/user/userModel.js");
const axios = require('axios');
const ics_management = require('../backend/ics_management.js');
const path = require('path');
const nodemailer = require('nodemailer');
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
    } else if (expiring_date.includes("-"))
    {
        parts = expiring_date.split("-");
    }
    else
    {
        throw new Error("Unsupported date format");
    }

    //wir gucken ob day bei den eingegebenen expiring date hat die groesse 2
    //wenn nicht, dann wir sollen '0' am anfang addieren
    const day = parts[2].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    //angenommen, dass gegebene datum ist: 15,01,24
    //dann wir sollen '20' bei 24 addieren um '2024' zu haben
    const year = parts[0].padStart(4, "20");

    const date_string = `${year}-${month}-${day}`;
    if (day > 31 || month > 12)
    {
        console.log(expiring_date)
        throw new Error('du hast ungueltige Datum eingegeben');
    }
    return new Date(date_string);
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
        const today = new Date().toISOString().slice(0, 10); // Get the current date in the format 'YYYY-MM-DD'

        let products_str = "";
        let array_ids = [];

        user.products.forEach(product => 
        {
            array_ids.push(product._id);
        });

        //each of these products should be added to the products_will_expire array
        //this should do three queries
        //one for the 'three days' before expiring date,
        //one for the 'week' before expiring date and the last one
        //one for the 'month' before the expiring date

        Product.find({
            _id: { $in: array_ids },
            email_receiving_date: {
                $gte: new Date(today),
                $lt: new Date(today + 'T23:59:59.999Z')
            }
        })
            .then(products =>
            {
                for (const product of products)
                {
                    products_will_expire.push(product);
                }
                //console.log("we are checking three days");

                if (products_will_expire.length >= 1)
                {

                    console.log("we found products that should be send an email for today: ")
                    for (const product of products_will_expire)
                    {
                        if (product.receiving_date == "three_days")
                        {
                            products_str = products_str + "The Product '" + product.name + "' will expire at: " + product.expiring_date + " which is three days away!\n";
                        }
                        else if (product.receiving_date == "week")
                        {
                            products_str = products_str + "The Product '" + product.name + "' will expire at: " + product.expiring_date + " which one Week away!\n";
                        }
                        else if (product.receiving_date == "month")
                        {
                            products_str = products_str + "The Product '" + product.name + "' will expire at: " + product.expiring_date + " which is one Month away!\n";
                        }
                    }
                    products_will_expire = [];//reset for the next query
                    send_email(user, products_str);
                }
            })
            .catch(error =>
            {
                console.error(error);
            });
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

    console.log("email text: \n" + text);

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
        await new Promise(resolve => setTimeout(resolve, hour_in_milisec * 25));//*24 so we can wait 25h before the next check
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
