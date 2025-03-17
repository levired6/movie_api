const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');

const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/cfdb');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//To parse JSON request bodies
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
//app.use(bodyParser.json());

//sends response for root endpoint.
app.get('/', (req, res) => {
  res.send(`Welcome to myFlix app! Here are the top 10 2025 Oscar nomonated movies!`);
});

/*
let movies = [
    {
      "Title": "Anora",
      "Discription": "A young escort from Brooklyn meets and impulsively marries the son of a Russian oligarch. Once the news reaches Russia, her fairy tale is threatened as his parents set out for New York to get the marriage annulled.",
      "Genre": { "Name": "Comedy, Drama, Romance"},
      "Director": {"Name": "Sean Baker"},
      "ImageURL": "images/Anora.jpg",
    },

    { 
        "Title": "The Brutalist",
        "Discription": "When a visionary architect and his wife flee post-war Europe in 1947 to rebuild their legacy and witness the birth of modern United States, their lives are changed forever by a mysterious, wealthy client.",
        "Genre":{ "Name": "Drama"},
        "Director": {"Name": "Brady Corbet",},
        "ImageURL": "images/The Brutalist.jpg",
      },

      { 
        "Title": "A Complete Unknown",
        "Discription": "Set in the influential New York City music scene of the early 1960s, A Complete Unknown follows 19-year-old Minnesota musician Bob Dylan's meteoric rise as a folk singer to concert halls and the top of the charts as his songs and his mystique become a worldwide sensation that culminates in his groundbreaking electric rock-and-roll performance at the Newport Folk Festival in 1965.",
        "Genre": { "Name": "Biography, Drama, Music"},
        "Director": {"Name": "James Mangold"},
        "ImageURL": "images/A Complete Unknown.jpg"
      },

      { 
        "Title": "Conclave",
        "Discription": "When Cardinal Lawrence is tasked with leading one of the world's most secretive and ancient events, selecting a new Pope, he finds himself at the center of a web of conspiracies and intrigue that could shake the very foundation of the Catholic Church.",
        "Genre": {"Name": "Drama, Mystery, Thriller"},
        "Director": {"Name": "Edward Berger"},
        "ImageURL": "images/Conclave.jpg"
      },

      { 
        "Title": "Dune: Part Two",
        "Discription": "Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.",
        "Genre": {"Name": "Action, Adventure, Drama, Sci-Fi"},
        "Director": {"Name": "Denis Villeneuve"},
        "ImageURL": "images/Dune2.jpg"
      },

      { 
        "Title": "Emilia Pérez",
        "Discription": "Emilia Pérez follows three remarkable women in Mexico, each pursuing their own happiness. Cartel leader Emilia enlists unappreciated lawyer Rita to help fake her death so that she can finally live authentically as her true self.",
        "Genre": {"Name": "Comedy, Crime, Drama, Musical, Thriller"},
        "Director": {"Name": "Jacques Audiard"},
        "ImageURL": "images/Emilia Perez.jpg"
      },

      { 
        "Title": "I'm Still Here",
        "Discription": "A mother is forced to reinvent herself when her family's life is shattered by an act of arbitrary violence during the tightening grip of a military dictatorship in Brazil, 1971.",
        "Genre": {"Name": "Biography, Drama, History"},
        "Director": {"Name": "Walter Salles"},
        "ImageURL": "images/I'm Still Here.jpg"
      },

      { 
        "Title": "Nickel Boys",
        "Discription": "Based on the Pulitzer Prize-winning novel by Colson Whitehead, Nickel Boys chronicles the powerful friendship between two young African-American men navigating the harrowing trials of reform school together in Florida.",
        "Genre": {"Name": "Drama"},
        "Director": {"Name": "RaMell Ross"},
        "ImageURL": "images/Nickel Boys.jpg"
      },

      { 
        "Title": "The Substance",
        "Discription": "A fading celebrity takes a black-market drug: a cell-replicating substance that temporarily creates a younger, better version of herself.",
        "Genre": {"Name": "Drama, Horror, Sci-Fi"},
        "Director": {"Name": "Coralie Fargeat"},
        "ImageURL": "images/The Substance.jpg"
      },

      { 
        "Title": "Wicked",
        "Discription": "Elphaba, a misunderstood young woman because of her green skin, and Galinda, a popular girl, become friends at Shiz University in the Land of Oz. After an encounter with the Wonderful Wizard of Oz, their friendship reaches a crossroads.",
        "Genre": {"Name": "Fantasy, Musical, Romance"},
        "Director": {"Name": "Jon M. Chu"},
        "ImageURL": "images/Wicked.jpg"
      },
];
let users = [
  {
    "id": 1,
    "name": "Kim",
    "email": "kim@example.com",
    "favoriteMovies": ["Wiked", "The Substance"]
  },
  {
    "id": 2,
    "name": "Joe",
    "email": "joe@example.com",
    "favoriteMovies": ["Anora"]
  },
]; //Users array data
*/

  //READ all movies
  app.get('/movies', async (req, res) => {
    await Movies.find()
    .then((movies)=> {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
  });

  //READ a movie by title
  app.get('/movies/:title', async (req, res) => {
    await Movies.findOne({title: req.params.title})
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
  });

  //READ a genre by name
  app.get('/movies/genres/:name' , async (req, res) => {
    await Movies.findOne({"genre.name": req.params.name })
    .then((movie) => {
      if (movie && movie.genre) {//Check if movie and genre exist
        res.json(movie.genre);
      }else {
        res.status(404).send('Genre not found');//handle case where genre is not found
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
  });

  //READ a director by name
  app.get('/directors/:directorName', async (req, res) => {
    await Movies.findOne({'director.name': req.params.directorName}, {'director': 1})
    .then((movie) => {
      if (movie && movie.director) {//Check if movie and director exist
        res.json(movie.director);
      }else{
        res.status(404).send('Director not found');//handle case where director is not found
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
  });

  // Add a user (Create)
app.post('/users', async (req, res) => {
  try {
      const existingUser = await Users.findOne({ username: req.body.username });

      if (existingUser) {
          return res.status(400).send(req.body.username + ' already exists');
      }

      const newUser = await Users.create({
          username: req.body.username,
          password: req.body.password, // Store hashed password
          email: req.body.email,
          birthday: req.body.birthday
      });

      res.status(201).json({newUser});

  } catch (error) {
      console.error(error);
      res.status(500).send('Error creating user: ' + error.message); // More specific error message
  }
});

//Get all users
app.get('/users', async (req, res) => {
  await Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:' + err);
  });
});

//Get a user by username
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({username: req.params.Username})
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error:' + err);
  });
});

//UPDATE a user's info, by username
app.put('/users/:username', async (req, res) => {
  try{
    const{ username, password, email, birthday} = req.body;
    const updatedUser = await Users.findOneAndUpdate(
      {username: req.params.username},
      {$set:
        {
          username: username,
          email: email,
          password: password,
          birthday: birthday
        }
      },
      {new: true}
    );
    if (!updatedUser) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(updatedUser);// Send the updated user as the response
  }catch (error) {
    console.error(error);
    res.status(500).send('Error updating user: ' + error.message); // More specific error message
  }
});

// CREATE Add a movie to a user's list of favorites
app.post('/users/:username/movies/:MovieID', async (req, res) => {
  try {
      const user = await Users.findOne({ username: req.params.username });

      if (!user) {
          return res.status(404).send('User not found');
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.MovieID)) {
          return res.status(400).send('Invalid MovieID');
      }

      const movie = await Movies.findById(req.params.MovieID);

      if (!movie) {
          return res.status(404).send("Movie not found");
      }

      const updatedUser = await Users.findOneAndUpdate(
          { username: req.params.username },
          { $push: { favoriteMovies: req.params.MovieID } },
          { new: true }
      );

      res.json(updatedUser);

  } catch (err) {
      console.error(err);
      res.status(500).send('Error adding movie to favorites: ' + err.message);
  }
});

// DELETE a user by username
app.delete('/users/:username', async (req, res) => {
  try {
      const user = await Users.findOneAndDelete({ username: req.params.username });

      if (!user) {
          return res.status(404).send(req.params.username + ' was not found'); // Changed to 404 for "Not Found"
      } else {
          return res.status(200).send(req.params.username + ' was deleted.');
      }
  } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err.message); // Included err.message for more detail
  }
});

// DELETE a movie from a user's list of favorites
app.delete('/users/:username/movies/:MovieID', async (req, res) => {
  try {
      const user = await Users.findOne({ username: req.params.username });

      if (!user) {
          return res.status(404).send('User not found');
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.MovieID)) {
          return res.status(400).send('Invalid MovieID');
      }

      const movie = await Movies.findById(req.params.MovieID);

      if (!movie) {
          return res.status(404).send("Movie not found");
      }

      const updatedUser = await Users.findOneAndUpdate(
          { username: req.params.username },
          { $pull: { favoriteMovies: req.params.MovieID } },
          { new: true }
      );

      res.json(updatedUser);

  } catch (err) {
      console.error(err);
      res.status(500).send('Error removing movie from favorites: ' + err.message);
  }
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something went wrong!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});