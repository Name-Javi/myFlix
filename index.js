const express = require('express');
morgan = require('morgan');
const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

//err catch
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//get requests
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my My Flix!');
});

app.get('/movies', (req, res) => {
  res.status(200).send(movies);
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// object variable with top movies
let movies = [
  {
    title: 'The House that Jack Built',
    description: 'In five episodes, failed architect and vicious sociopath Jack recounts his elaborately orchestrated murders -- each, as he views them, a towering work of art that ...',
    genre: ['Psychological','Horror'],
    director: 'Lars von Trier',
    year: 2018
  },
  {
    title: 'Spirited Away',
    description: '10-year-old Chihiro (Daveigh Chase) moves with her parents to a new home in the Japanese countryside. After taking a wrong turn down a wooded path, Chihiro and her parents discover an amusement park with a stall containing an assortment of food. To her surprise, Chihiro\'s parents begin eating and then transform into pigs.',
    genre: ['Animation', 'Adventure', 'Family'],
    director: 'Hayao Miyazaki',
    year: 2001
  },
  {
    title: 'I am Legend',
    description: 'Years after a plague kills most of humanity and transforms the rest into monsters, the sole survivor in New York City struggles valiantly to find a cure.',
    genre: 'Drama',
    director: 'Francis Lawrence',
    year: 2007
  },
  {
    title: 'Lala Land',
    description: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    genre: ['Drama', 'Musical']
    director: 'Damien Chazelle',
    year: 2016
},
{
    title: 'Click',
    description: 'A workaholic architect finds a universal remote that allows him to fast-forward and rewind to different parts of his life. Complications arise when the remote starts to overrule his choices.',
    genre: 'Comedy',
    director: 'Frank Coraci',
    year: 2006
},
{
    title: 'Joker',
    description: 'Arthur Fleck, a party clown, leads an impoverished life with his ailing mother. However, when society shuns him and brands him as a freak, he decides to embrace the life of crime and chaos.',
    genre: 'Thriller',
    director: 'Todd Phillips',
    year: 2019
},
{
    title: 'The Fast and the Furious',
    description: 'Los Angeles police officer Brian O\'Conner must decide where his loyalty really lies when he becomes enamored with the street racing world he has been sent undercover to destroy.',
    genre: ['Action', 'Thriller']
    director: 'Rob Cohen',
    year: 2001
},
{
    title: 'Black Panther',
    description: 'T\'Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward to lead his people into a new future and must confront a challenger from his country\'s past.',
    genre: ['Action', 'Adventrure'. 'Sci-fi']
    director: 'Ryan Coogler',
    year: 2018
}
];