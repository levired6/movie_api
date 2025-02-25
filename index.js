const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');

const app = express();
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//To parse JSON request bodies
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());

//sends response for root endpoint.
app.get('/', (req, res) => {
  res.send(`Welcome to myFlix app! Here are the top 10 2025 Oscar nomonated movies!`);
});

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

//Create
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }else {
    res.status(400).send(`Users Need Names`)
  }
})

//UPDATE
app.put('/users/:id', (req, res) => {
  const {id} = req.params;
  const updateUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updateUser.name;
    res.status(200).json(user);
  }else {
    res.status(400).send(`No Such User`)
  } 
})

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const {id, movieTitle} = req.params;
  

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  }else {
    res.status(400).send(`no such user`)
  } 
})

//Read
app.get('/movies', (req, res) => {
  res.status(200).json(movies);  
}) 

//Read
app.get('/movies/:title', (req, res) => {
  const {title} = req.params;
  const movie = movies.find( movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  }else {
    res.status(400).send(`no such movie`)
  }

})

//Read
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  }else {
    res.status(400).send(`no such genre`)
  }

})

//Read
app.get('/movies/directors/:directorName', (req, res) => {
  const {directorName} = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  }else {
    res.status(400).send(`no such director`)
  }
})

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const {id, movieTitle} = req.params;
  

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(movie => movie !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);;
  }else {
    res.status(400).send(`no such user`)
  } 
});

//DELETE
app.delete('/users/:id', (req, res) => {
  const {id} = req.params;
  

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  }else {
    res.status(400).send(`no such user`)
  } 
});

/*app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something went wrong!');
});
*/
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});