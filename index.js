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
let movies = [
    {
      title: "Anora",
      discription: "A young escort from Brooklyn meets and impulsively marries the son of a Russian oligarch. Once the news reaches Russia, her fairy tale is threatened as his parents set out for New York to get the marriage annulled.",
      genre: "Comedy, Drama, Romance",
      director: "Sean Baker",
      imageURL: "images/Anora.jpg"
    },

    { 
        title: "The Brutalist",
        discription: "When a visionary architect and his wife flee post-war Europe in 1947 to rebuild their legacy and witness the birth of modern United States, their lives are changed forever by a mysterious, wealthy client.",
        genre: "Drama",
        director: "Brady Corbet",
        imageURL: "images/The Brutalist.jpg"
      },

      { 
        title: "A Complete Unknown",
        discription: "Set in the influential New York City music scene of the early 1960s, A Complete Unknown follows 19-year-old Minnesota musician Bob Dylan's meteoric rise as a folk singer to concert halls and the top of the charts as his songs and his mystique become a worldwide sensation that culminates in his groundbreaking electric rock-and-roll performance at the Newport Folk Festival in 1965.",
        genre: "Biography, Drama, Music",
        director: "James Mangold",
        imageURL: "images/A Complete Unknown.jpg"
      },

      { 
        title: "Conclave",
        discription: "When Cardinal Lawrence is tasked with leading one of the world's most secretive and ancient events, selecting a new Pope, he finds himself at the center of a web of conspiracies and intrigue that could shake the very foundation of the Catholic Church.",
        genre: "Drama, Mystery, Thriller",
        director: "Edward Berger",
        imageURL: "images/Conclave.jpg"
      },

      { 
        title: "Dune: Part Two",
        discription: "Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.",
        genre: "Action, Adventure, Drama, Sci-Fi",
        director: "Denis Villeneuve",
        imageURL: "images/Dune2.jpg"
      },

      { 
        title: "Emilia Pérez",
        discription: "Emilia Pérez follows three remarkable women in Mexico, each pursuing their own happiness. Cartel leader Emilia enlists unappreciated lawyer Rita to help fake her death so that she can finally live authentically as her true self.",
        genre: "Comedy, Crime, Drama, Musical, Thriller",
        director: "Jacques Audiard",
        imageURL: "images/Emilia Perez.jpg"
      },

      { 
        title: "I'm Still Here",
        discription: "A mother is forced to reinvent herself when her family's life is shattered by an act of arbitrary violence during the tightening grip of a military dictatorship in Brazil, 1971.",
        genre: "Biography, Drama, History",
        director: "Walter Salles",
        imageURL: "images/I'm Still Here.jpg"
      },

      { 
        title: "Nickel Boys",
        discription: "Based on the Pulitzer Prize-winning novel by Colson Whitehead, Nickel Boys chronicles the powerful friendship between two young African-American men navigating the harrowing trials of reform school together in Florida.",
        genre: "Drama",
        director: "RaMell Ross",
        imageURL: "images/Nickel Boys.jpg"
      },

      { 
        title: "The Substance",
        discription: "A fading celebrity takes a black-market drug: a cell-replicating substance that temporarily creates a younger, better version of herself.",
        genre: "Drama, Horror, Sci-Fi",
        director: "Coralie Fargeat",
        imageURL: "images/The Substance.jpg"
      },

      { 
        title: "Wicked",
        discription: "Elphaba, a misunderstood young woman because of her green skin, and Galinda, a popular girl, become friends at Shiz University in the Land of Oz. After an encounter with the Wonderful Wizard of Oz, their friendship reaches a crossroads.",
        genre: "Fantasy, Musical, Romance",
        director: "Jon M. Chu",
        imageURL: "images/Wicked.jpg"
      },
];
let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Joe",
    email: "joe@example.com",
    favoriteMovies: ["Anora"]
  },
]; //Users array data

//Create
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (!newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }else {
    res.status(400).send('user with this name or email exists')
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
    res.status(400).send('no such user')
  } 
})

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const {id, movieTitle} = req.params;
  

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);;
  }else {
    res.status(400).send('no such user')
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
    res.status(400).send('no such user')
  } 
})

//DELETE
app.delete('/users/:id', (req, res) => {
  const {id} = req.params;
  

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  }else {
    res.status(400).send('no such user')
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
    res.status(400).send('no such movie')
  }
})
//Read
app.get('/movies/genre/:genreName', (req, res) => {
  const {genreName} = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  }else {
    res.status(400).send('no such genre')
  }
})
//Read
app.get('/movies/directorName/:directorName', (req, res) => {
  const {directorName} = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  }else {
    res.status(400).send('no such director')
  }
})

//sends response for root endpoint.
app.get('/', (req, res) => {
  res.send('Welcome to myFlix app! Here are the top 10 2025 Oscar nomonated movies!');
});



/*app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something went wrong!');
});
*/
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});