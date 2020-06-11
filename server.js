'use strict'
const superagent = require('superagent');
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const app = express();
app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT || 3001;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

////////////////LOCATION

app.get('/location', (request, response) => {

  try {
    let city = request.query.city;
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;
    let safeValue = [city];
    let sqlQuery = 'SELECT * FROM locations WHERE search_query LIKE ($1);';


    client.query(sqlQuery, safeValue)
    .then(sqlResults => {
      console.log(city)
        if (sqlResults.rowCount !== 0) {
          console.log(sqlResults);
          response.status(200).send(sqlResults.rows[0]);
        } else {
          superagent.get(url)
            .then(resultsFromSuperAgent => {
              console.log('api route', resultsFromSuperAgent.body)
              let finalObj = new Location(city, resultsFromSuperAgent.body[0]);
              response.status(200).send(finalObj);
              console.log(Location);
              let sqlQuery = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
              let safeValue = [finalObj.search_query, finalObj.formatted_query, finalObj.latitude, finalObj.longitude];
              client.query(sqlQuery, safeValue)
              .then(()=>{})
            })
            .catch(err => console.log(err))
        }
      })
  } catch (err) {
    console.log('Error', err);
    response.status(500).send('your call cannot be completed at this time');
  }
})

function Location(search_query, obj) {
  this.search_query = search_query;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
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

app.get('*', (request, response) => {
  response.status(404).send('sorry!')
})


client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })