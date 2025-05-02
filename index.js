const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const { check, validationResult } = require('express-validator');//Import express-validator

//mongoose.connect('mongodb://localhost:27017/cfdb')//Connect to MongoDB database
console.log(process.env.CONNECTION_URI)
mongoose.connect( process.env.CONNECTION_URI)//Connect to MongoDB database
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error: ', err));

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//To parse JSON request bodies
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

const cors = require('cors');
app.use(cors());
let auth = require('./auth')(app);//Imports the auth.js file to create the endpoint for login
const passport =require('passport'); 
require('./passport');//Passport module to import the passport.js file into the project

//sends response for root endpoint.
app.get('/', (req, res) => {
  res.send(`Welcome to myFlix app! Here are the top 10 2025 Oscar nomonated movies!`);
});

const allowedOrigins = ['http://localhost:8080', 'https://oscars2025-f0070acec0c4.herokuapp.com/', 'http://localhost:1234'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

  //READ all movies
  app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
  app.get('/movies/:title', passport.authenticate('jwt', { session: false }),async (req, res) => {
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
  app.get('/movies/genres/:name' , passport.authenticate('jwt', { session: false }), async (req, res) => {
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
  app.get('/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.post('/users',[//Validation middleware
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
    check('birthday', 'Birthday is not valid').isISO8601().optional({ nullable: true }), // Optional birthday
  ], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  try {
      const existingUser = await Users.findOne({ username: req.body.username });

      if (existingUser) {
          return res.status(400).send(req.body.username + ' already exists');
      }

      const hashedPassword = Users.hashPassword(req.body.password);
      const newUser = await Users.create({
          username: req.body.username,
          password: hashedPassword, // Store hashed password
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
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [ // Validation middleware
  check('username', 'Username is required').isLength({ min: 5 }),
  check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be valid').isEmail(),
  check('birthday', 'Birthday is not valid').isISO8601().optional({ nullable: true }), // Optional birthday
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
   // CONDITION TO CHECK ADDED HERE
   if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
}
// CONDITION ENDS
  try{
    const{ username, password, email, birthday} = req.body;
    const hashedPassword = Users.hashPassword(password);
    const updatedUser = await Users.findOneAndUpdate(
      {username: req.params.username},
      {$set:
        {
          username: username,
          email: email,
          password: hashedPassword,
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
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

      // Check if the movie is already in the user's favorites
      if (user.favoriteMovies.includes(req.params.MovieID)) {
        return res.status(400).send('This movie has already been added to your favorites.');
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
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
        // **ADDED THIS CHECK SO THAT YOU CANT DELETE OTHER USERS:**
        if (req.user.username !== req.params.username) {
          return res.status(403).send('Permission denied. You can only delete your own account.'); // 403 Forbidden
        }
        
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
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
