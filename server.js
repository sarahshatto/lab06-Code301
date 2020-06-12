'use strict'
const superagent = require('superagent');
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const { json } = require('express');
const app = express();
app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT || 3001;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

//////////////// LIST OF HANDLERS:

app.get('/location', locationHandler); 
app.get('/location', movieHandler); 
// app.get('/restaurants', restaurantHandler); 
// app.get('*', handleNotFound); 


//////////////// LOCATION HANDLER: 

function locationHandler(request, response){

  let city = request.query.city; // get the city the user requested  
  let url = 'https://us1.locationiq.com/v1/search.php'; // grab the URL and put in the API key 
  let safeValue = [city]; // Setup the SQL query  
  let sqlQuery = 'SELECT * FROM locations WHERE search_query LIKE ($1);'; // database: grab everything from table that matches search_query
  const queryParams = {
    key: process.env.GEO_DATA_API_KEY,
    q: city,
    format: 'json',
    limit: 1
  }

  client.query(sqlQuery, safeValue)
    .then(sqlResults => {
      console.log(city);
      if (sqlResults.rowCount !== 0) {
        console.log(sqlResults);
        response.status(200).send(sqlResults.rows[0]);
      } else {
        superagent.get(url)
        .query(queryParams)
        .then(data => {
          console.log('location results from superagent', data.body);
          const geoData = data.body[0];
          const location = new Location(city, geoData);

          response.status(200).send(location);
        }).catch(err => {
          console.log(err)
          response.status(500).send('Sorry, something went wrong!');
        })
      }
    })
  }

////////////////WEATHER 

app.get('/weather', (request, response) => {
  let search_query = request.query.search_query;

  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${process.env.WEATHER_API_KEY}`;

  superagent.get(url)
    .then(resultsFromSuperAgent => {
      let weatherResult = resultsFromSuperAgent.body.data.map(day => {
        return new Weather(day);

      })
      response.status(200).send(weatherResult);
    }).catch(err => console.log(err));
})

function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
  // array.push(this);
}

////////////////HIKING

app.get('/trails', (request, response) => {
  try {
    let latitude = request.query.latitude;
    let longitude = request.query.longitude;

    let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;

    superagent.get(url)
      .then(resultsFromSuperAgent => {
        let hikingResults = resultsFromSuperAgent.body.trails.map(hike => new Hiking(hike));
        response.status(200).send(hikingResults);
      }).catch(err => console.log(err))
  } catch (err) {
    console.log(err);
    response.status(500).send('Sorry! Take a Hike!');
  }
})

//////////////// MOVIE HANDLER 

function movieHandler(request, response){

  let city = request.query.search_query;
  let url= 'https://api.themoviedb.org/3/search/movie';
  let safeValue = [city];
  let sqlQuery = 'SELECT * FROM locations WHERE search_query LIKE ($1);'; 

  const queryParams = {
    key: process.env.MOVIE_API_KEY,
    q: city,
    format: 'json',
    limit: 5,
  }
  client.query(sqlQuery, safeValue)
  .then(sqlResults => {
    console.log(city);
    if (sqlResults.rowCount !== 0) {
      console.log(sqlResults);
      response.status(200).send(sqlResults.rows[0]);
    } else {
      superagent.get(url)
      .query(queryParams)
      .then(data => {
        console.log('movie results from superagent', data.body);
        const geoData = data.body[0];
        const location = new Location(city, geoData);

        response.status(200).send(location);
      }).catch(err => {
        console.log(err)
        response.status(500).send('Sorry, something went wrong!');
      })
    }
  })

}

//////////////// YELP HANDLER: 

// function yelpHandler(request, response){
//   let city = request.query.search_query;
//   let url = https://api.yelp.com/v3/businesses/search
    
// }

//////////////// CONSTRUCTORS: 

function Location(search_query, obj) {
  this.search_query = search_query;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

function Hiking(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = `${obj.conditionDetails || ''} ${obj.conditionStatus}`;
  this.conditions_date = obj.conditionDate.slice(0, obj.conditionDate.indexOf(' '));
  this.conditions_time = obj.conditionDate.slice(obj.conditionDate.indexOf(' ') + 1, obj.conditionDate.length);
}

function Movies(obj){
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.released_date;
}

////////////////
app.get('*', (request, response) => {
  response.status(404).send('sorry!')
})


client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })