'use strict'
// The name of the library that is going to create the server : express
const express = require('express')
const app = express();

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// serve static files from a public directory
// app.use(express.statis('./public'));

// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;

app.get('/', (request, response) => {
  console.log('Hello out there');
  response.send('I like pizza');
})

app.get('/public', (request, response) => {
  console.log('It is monday');
  response.send('Tell me about it');
})

// start the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
