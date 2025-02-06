const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

const topMovies = [
    { title: "Movie 1" , director: "Director 1"},
    { title: "Movie 2" , director: "Director 2"}
];

app.use(morgan('common'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/movies', (req, res) => {
    res.json('topMovies');
});

app.get('/', (req, res) => {
    res.send('Welcome to my movie app!');
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something went wrong!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});