const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
//const port = 8080;

//To parse JSON request bodies
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());
let topMovies = [
    {
      title: "Movie 1",
      discription: "Discription",
      genre: "Action",
      director: "Director 1",
      imageURL: "url1.jpg"
    },

    { 
        title: "Movie 2",
        discription: "Discription",
        genre: "Action",
        director: "Director 2",
        imageURL: "url1.jpg"
      },

      { 
        title: "Movie 3",
        discription: "Discription",
        genre: "Action",
        director: "Director 3",
        imageURL: "url1.jpg"
      },

      { 
        title: "Movie 4",
        discription: "Discription",
        genre: "Action",
        director: "Director 4",
        imageURL: "url1.jpg"
      },

      { 
        title: "Movie 5",
        discription: "Discription",
        genre: "Action",
        director: "Director 5",
        imageURL: "url1.jpg"
      },

      { 
        title: "Movie 6",
        discription: "Discription",
        genre: "Action",
        director: "Director 6",
        imageURL: "url1.jpg"
      },

      { 
        title: "Movie 7",
        discription: "Discription",
        genre: "Action",
        director: "Director 7",
        imageURL: "url1.jpg"
      },

      { 
        title: "Movie 8",
        discription: "Discription",
        genre: "Action",
        director: "Director 8",
        imageURL: "url1.jpg"
      },

      { 
        title: "Movie 9",
        discription: "Discription",
        genre: "Action",
        director: "Director 9",
        imageURL: "url1.jpg"
      },

      { 
        title: "Movie 10",
        discription: "Discription",
        genre: "Action",
        director: "Director 10",
        imageURL: "url1.jpg"
      },
];
let users = []; //Users array data

//sends response for root endpoint.
app.get('/', (req, res) => {
  res.send('Welcome to my Flix App!');
});
//return a list of all movies(bonus)
app.get('/movies/:title', (req, res) => {
  const title = req.params.title;
  const movie = topMovies.find(m => m.title === title);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

//Get a user by ID
app.get('/users/:id', (req, res) => {
  res.send('Successful GET request returning data for user with ID: ${req.params.id}');
});

//Regiser a new user
app.post('/users', (req, res) => {
  res.send('Successful POST request to register a new user');
});

//Update user information
app.put('/users/:id',(req, res) => {
  res.send('Successful PUT request to update user information for user with ID: ${req.params.id}');
});

//Delete a user
app.delete('/users/:id', (req, res) => {
  res.send('Successful DELETE request to delete user with ID: ${req.params.id}');
});

//Add a movie t0 user favorites
app.post('/users/:id/favorites/:movieID', (req, res) => {
  res.send(`Successful GET request to POST request to add movie ${req.params.movieID} to user ${req.params.id}'s favorites`);
});

//Get users favorite movies
app.get('/users/:id/favorites', (req, res) => {
  res.send(`Successful GET request returning data for user ${req.params.id}'s favorite movies`);
    });

    //Remove a movie from user's favorites
    app.delete('/users/:id/favorites/:movieID', (req, res) => {
      res.send(`Successful DELETE request to remove movie ${req.params.movieID} from user ${req.params.id}'s favoites`);
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something went wrong!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});