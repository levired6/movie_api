const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const { check, validationResult } = require('express-validator');
const cors = require('cors');

// mongoose.connect('mongodb://localhost:27017/cfdb') // Connect to MongoDB database
console.log(process.env.CONNECTION_URI);
mongoose.connect(process.env.CONNECTION_URI) // Connect to MongoDB database
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error: ', err));

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

// To parse JSON request bodies
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define allowed origins for CORS
const allowedOrigins = ['http://localhost:1234', 'https://oscars2025-f0070acec0c4.herokuapp.com', 'http://localhost:8080', 'https://oscars2025.netlify.app'];

// Enable CORS for all routes and origins
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
}));

// Enable pre-flight for all routes
//app.options('*', cors());

let auth = require('./auth'); // Imports the auth.js file to create the endpoint for login
const appRouter = express.Router();
auth(appRouter);
app.use('/', appRouter);
const passport = require('passport');
require('./passport'); // Passport module to import the passport.js file into the project

// sends response for root endpoint.
app.get('/', (req, res) => {
  res.send(`Welcome to myFlix app! Here are the top 10 2025 Oscar nominated movies!`);
});

// READ all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(200).json(movies); // Changed to 200 OK for successful GET
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error: ' + err.message || 'An unexpected error occurred.' }); // Corrected to JSON
    });
});

// READ a movie by MovieID (UPDATED)
app.get('/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Check if the provided movieId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.movieId)) {
      return res.status(400).send('Invalid Movie ID format.');
    }
    const movie = await Movies.findById(req.params.movieId); // Use findById to search by _id
    if (!movie) {
      return res.status(404).send('Movie not found.'); // Send 404 if no movie is found with that ID
    }
    res.status(200).json(movie); // Return the movie data
  } catch (err) {
    console.error(err);
    // Specifically catch CastError if mongoose.Types.ObjectId.isValid somehow misses something
    if (err.name === 'CastError' && err.path === '_id') {
      return res.status(400).send('Invalid Movie ID format.');
    }
    res.status(500).json({ message: 'Error: ' + err.message || 'An unexpected error occurred.' }); // Corrected to JSON
  }
});

// READ a genre by name
app.get('/movies/genres/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ "genre.name": req.params.name })
    .then((movie) => {
      if (movie && movie.genre) { // Check if movie and genre exist
        res.json(movie.genre);
      } else {
        res.status(404).send('Genre not found'); // handle case where genre is not found
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error: ' + err.message || 'An unexpected error occurred.' }); // Corrected to JSON
    });
});

// READ a director by name
app.get('/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ 'director.name': req.params.directorName }, { 'director': 1 })
    .then((movie) => {
      if (movie && movie.director) { // Check if movie and director exist
        res.json(movie.director);
      } else {
        res.status(404).send('Director not found'); // handle case where director is not found
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error: ' + err.message || 'An unexpected error occurred.' }); // Corrected to JSON
    });
});

// Add a user (CREATE / Register)
app.post('/users', [ // Validation middleware
  check('username', 'Username is required').isLength({ min: 5 }),
  check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(), // Password required for registration
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

    res.status(201).json(newUser); // Return just the user object, not {newUser: ...}

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user: ' + (error.message || 'An unexpected error occurred.') }); // Corrected to JSON
  }
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(200).json(users); // Changed to 200 OK for successful GET
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error: ' + err.message || 'An unexpected error occurred.' }); // Corrected to JSON
    });
});

// Get a user by username
// UPDATED: Now populates favoriteMovies to include movie details
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // FIX: Ensure correct username casing in req.params
  try {
    const user = await Users.findOne({ username: req.params.username })
      .populate('favoriteMovies.movieId'); // Populate the movieId field within favoriteMovies

    if (!user) {
      return res.status(404).send('User not found.');
    }

    // Permission check: Ensure authenticated user is requesting their own profile
    if (req.user.username !== req.params.username) {
      return res.status(403).send('Permission denied: You can only view your own profile.');
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error: ' + err.message || 'An unexpected error occurred.' }); // Corrected to JSON
  }
});

// UPDATE a user's info, by username
// THIS IS THE CORRECTED AND MERGED BLOCK
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [ // Validation middleware
  check('username', 'Username is required').isLength({ min: 5 }),
  check('username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
  
  // Password validation: min 5 chars, optional, allows any type
  check('password', 'Password must be at least 5 characters long.')
    .optional() // Allows password to be optional for updates
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long.'),

  check('email', 'Email does not appear to be valid').isEmail(),
  check('birthday', 'Birthday is not valid').isISO8601().optional({ nullable: true }), // Optional birthday
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Permission check: Ensure authenticated user is updating their own profile
  if (req.user.username !== req.params.username) {
    return res.status(403).send('Permission denied: You can only update your own account.'); // 403 Forbidden
  }

  // Handle username change: Ensure new username is not already taken
  if (req.body.username && req.body.username !== req.params.username) {
    const existingUser = await Users.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).send('Username already exists. Please choose a different username.');
    }
  }

  let hashedPassword;
  // ONLY hash the password if it was provided in the request body
  if (req.body.password) {
    hashedPassword = Users.hashPassword(req.body.password);
  }

  // Construct the update object based on provided fields (only update if present in req.body)
  let updateFields = {};
  if (req.body.username !== undefined) updateFields.username = req.body.username; // Use !== undefined for explicit check
  if (req.body.email !== undefined) updateFields.email = req.body.email;
  if (req.body.birthday !== undefined) updateFields.birthday = req.body.birthday;
  
  // If a new password was provided, add the hashed password to update fields
  if (hashedPassword) {
    updateFields.password = hashedPassword;
  }

  try {
    // Find the user by their current username (from URL params) and update
    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.username },
      { $set: updateFields }, // Use $set to update only the provided fields
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).send('User not found.');
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user: ' + (error.message || 'An unexpected error occurred.') }); // Corrected to JSON
  }
});

// CREATE Add a movie to a user's list of favorites (with comment)
// UPDATED: Now accepts a 'comment' in the request body and stores it with the movie ID
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Permission check: Ensure authenticated user is modifying their own favorites
    if (req.user.username !== req.params.username) {
      return res.status(403).send('Permission denied: You can only modify your own favorites.');
    }

    // Validate if MovieID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.MovieID)) {
        return res.status(400).send('Invalid Movie ID format.');
    }

    const { comment } = req.body; // Extract comment from request body

    const user = await Users.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const movie = await Movies.findById(req.params.MovieID);

    if (!movie) {
      return res.status(404).send("Movie not found");
    }

    // Check if the movie is already in the user's favorites
    // Corrected logic to safely access _id from populated movie object
    const isAlreadyFavorite = user.favoriteMovies.some(fav => 
        fav.movieId && (fav.movieId._id.toString() === req.params.MovieID)
    );
    if (isAlreadyFavorite) {
      return res.status(400).send('This movie has already been added to your favorites.');
    }

    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.username },
      { $push: { favoriteMovies: { movieId: req.params.MovieID, comment: comment || '' } } }, // Push object with movieId and comment
      { new: true }
    ).populate('favoriteMovies.movieId'); // Populate the movie details within favoriteMovies array

    res.json(updatedUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding movie to favorites: ' + (err.message || 'An unexpected error occurred.') }); // Corrected to JSON
  }
});

// DELETE a user by username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // **CRITICAL: Ensure authenticated user is deleting their own account**
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
    return res.status(500).json({ message: 'Error: ' + (err.message || 'An unexpected error occurred.') }); // Corrected to JSON
  }
});

// DELETE a movie from a user's list of favorites
// UPDATED: Now removes the object containing the movieId
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Permission check: Ensure authenticated user is modifying their own favorites
    if (req.user.username !== req.params.username) {
      return res.status(403).send('Permission denied: You can only modify your own favorites.');
    }

    // Validate if MovieID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.MovieID)) {
        return res.status(400).send('Invalid Movie ID format.');
    }

    const user = await Users.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // The movie doesn't need to exist as a standalone entry in the database
    // for us to remove it from the user's favorites array.
    // However, if you want to ensure it's a valid movie ID that ever existed,
    // you could fetch it like this (but not strictly necessary for deletion from user's list)
    // const movie = await Movies.findById(req.params.MovieID);
    // if (!movie) {
    //   return res.status(404).send("Movie not found");
    // }

    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { favoriteMovies: { movieId: req.params.MovieID } } }, // Pull object where movieId matches
      { new: true }
    ).populate('favoriteMovies.movieId'); // Populate the movie details within favoriteMovies array

    res.json(updatedUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing movie from favorites: ' + (err.message || 'An unexpected error occurred.') }); // Corrected to JSON
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!' }); // Corrected to JSON
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});