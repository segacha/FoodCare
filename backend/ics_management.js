//for handling paths on linux and windows
const path = require('path');
//npm install -S ics
const ics = require('ics')
const { writeFileSync: write_file_sync } = require('fs');
const { unlink } = require('fs');


//this should take an array with all the products that will expire
//make an all-day event for each one of them
//put all event in an arry, and make one file for all events
//this function wont have any returns
async function make_ics_file(products)
{
  let events = [];
  products.forEach((product) =>
  {
    let expiring_date = product.expiring_date;
    //getting an 'Date' object von der expiring date
    expiring_date = get_date_obj(expiring_date);


    //calculating the next day of the expiring date
    let next_day = new Date(expiring_date.getTime() + (24 * 60 * 60 * 1000));
    let expiring_date_day = expiring_date.getDate();
    let expiring_date_month = expiring_date.getMonth() + 1;//it starts by januar = 0 und dez = 11
    let expiring_date_year = expiring_date.getFullYear();

    let next_day_day = next_day.getDate();
    let next_day_month = next_day.getMonth() + 1;//it starts by januar = 0 und dez = 11
    let next_day_year = next_day.getFullYear();

    let event_attributs =
    {
      title: `${product.name} is expiring today!`,
      description: "You enterd this product on your FoodCare page, and we are sadly want to tell you, it will expire today..",
      busyStatus: 'FREE',
      start: [expiring_date_year, expiring_date_month, expiring_date_day],
      end: [next_day_year, next_day_month, next_day_day],
    };

    //pushing the event(also den termin) of each product in dem array
    events.push(event_attributs);
  });

  //wenn wir mehr als ein event haben, dann wir sollen 'ics.createEvents() aufrufen
  if (events.length >= 2)
  {
    //wir legen alle events (die in array events sind) von alle producte in einem ics datei und ereugen ihn
    ics.createEvents(events,
      (error, value) =>
      {
        if (error)
        {
          console.log("sadly we had some error trying to make an calendar event:\n", error);
        }
        //this will make the a ics datei called 'events.ics' im selben verzeichnes wie server.js
        write_file_sync(path.join(__dirname, "events.ics"), value);
      }
    );
  }
  //else also wenn wir nur einen event haben, dann rufen wir .createEvent()
  else
  {
    //wir legen alle events von alle producte in einem ics datei und ereugen ihn
    ics.createEvent(events[0],
      (error, value) =>
      {
        if (error)
        {
          console.log("sadly we had some error trying to make an calendar event..:\n", error)
        }
        //this will make the a ics datei called 'events.ics' im selben verzeichnes wie server.js
        write_file_sync(`${__dirname}/events.ics`, value)
      }
    );
  }
}

async function delete_ics_file()
{
  //nochmal, wir benutzen path modul wegen der unterschied zwischen
  //file path linux/mac und Windows 
  unlink(path.join(__dirname, "events.ics"), (err) =>
  {
    if (err)
    {
      console.error('Error deleting file:', err);
      return;
    }
    console.log('File deleted successfully!');
  });
}

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


module.exports = { delete_ics_file, make_ics_file };