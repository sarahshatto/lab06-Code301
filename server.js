'use strict'
// The name of the library that is going to create the server : express
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// serve static files from a public directory
// app.use(express.statis('./public'));

// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;

// app.get('/', (request, response) => {
//   console.log('Hello out there');
//   response.send('I like pizza');
// })

// app.get('/public', (request, response) => {
//   console.log('It is monday');
//   response.send('Tell me about it');
// })

////////////////LOCATION

  app.get('/location', (request, response) => {
    try {
    console.log(request.query.city);
    let search_query = request.query.city;
    let geoData = require('./data/location.json');
    let returnObj = new Location (search_query, geoData[0]);

    response.status(200).send(returnObj);
    }
    catch(err){
      console.log('Error!', err);
      response.status(500).send('Oh no!');
    }
  });

  function Location (search_query, obj){
    this.search_query = search_query;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat; 
    this.longitude = obj.lon;
  }

////////////////WEATHER 

  app.get('/weather', (request, response) => {
  try {
    let weatherArray = [];
    let geoData = require('./data/weather.json');
    geoData.data.forEach(day => {
      new Weather(day, weatherArray);
    })
    response.status(200).send(weatherArray);
  }
  catch(err){
    console.log('Error!', err);
    response.status(500).send('sorry! Issue with our servers!');
  }

})

function Weather(obj, array){
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
  array.push(this);
}

// 
app.get('*', (request, response) => {
  response.status(404).send('sorry!')
})

// start the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
