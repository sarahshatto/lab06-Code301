'use strict'
const superagent = require('superagent')
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
    // try {
    // console.log(request.query.city);
    let city = request.query.city;
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;
  
    superagent.get(url)
    .then(resultsFromSuperAgent => {
      let finalObj = new Location(city, resultsFromSuperAgent.body[0]);
      response.status(200).send(finalObj);
    })
  // }
    // catch(err){
    //   console.log('Error!', err);
    //   response.status(500).send('Oh no!');
    // }
})

  function Location (search_query, obj){
    this.search_query = search_query;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat; 
    this.longitude = obj.lon;
  }

////////////////WEATHER 

  app.get('/weather', (request, response) => {
  try {
    let geoData = require('./data/weather.json');
    let weatherArray = geoData.data.map(day => {
      return new Weather(day);
    })
    response.status(200).send(weatherArray);
  }
  catch(err){
    console.log('Error!', err);
    response.status(500).send('sorry! Issue with our servers!');
  }

})

function Weather(obj){
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
  // array.push(this);
}

// 
app.get('*', (request, response) => {
  response.status(404).send('sorry!')
})

// start the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
