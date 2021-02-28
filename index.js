const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const { check, validationResult } = require('express-validator');


const app = express();
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI,
 {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());

app.use(morgan('common'));

app.use(express.static('public'));

app.use(bodyParser.json());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport.js');

//err catch
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//GET REQUESTS
app.get('/', (req, res) => {
  res.send('Welcome to myFlix');
});

//get list of movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
  .then((movies) => {
      res.status(201).json(movies);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});
//get info about a single movie by title
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({
      Title: req.params.Title
    })
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//get data about a genre by title
app.get('/movies/:Title/Genre/', (req, res) =>  {
  Movies.findOne({ Title: req.params.Title })
  .then((movies) => {
      res.status(201).json(movies.Genre);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});
//get data about a director by name
app.get('/movies/:Name/Directors/', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
  .then((director) => {
      res.status(201).json(director.Director);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});
//User get requests
//Get list of users
app.get('/users', (req, res) => {
  Users.find()
  .then((users) => {
      res.status(201).json(users);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});
//Get user info based on username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.userName })
  .then((user) => {
      res.json(user);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});
// Let users update their user info based on username
app.put('/users/:Username',  (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
  { $set:
      {
          FirstName: req.body.FirstName,
          LastName: req.body.LastName,
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birth: req.body.Birth
      }
  },
  { new: true }, //  Returns updated document 
  (err, updatedUser) => {
      if(err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
      } else {
          res.json(updatedUser);
      }
  });
});

// Let users add a movie to their favorites
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.userName }, 
  { $push: { FavoriteMovies: req.params.MovieID }},
  { new: true },
  (err, updatedUser) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
      } else {
          res.json(updatedUser);
      }
  });
});

//post new user account
app.post('/users',
  [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  let errors = validationResult(req); //checks the validation object for errors

  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOne({
      userName: req.body.userName
    })
    .then(users => {
      if (users) {
        return res.status(400).send(req.body.userName + 'already exists');
      } else {
        Users
          .create({
            userName: req.body.userName,
            passWord: hashedpassWord,
            Email: req.body.Email,
            birthDate: req.body.birthDate
          })
          .then((users) => {
            res.status(201).json(users)
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});
// Let users remove movie from their favorites
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
  { $pull: { FavoriteMovies: req.params.MovieID }},
  { new: true },
  (err, updatedUser) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
      } else {
          res.json(updatedUser);
      }
  });
});

app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({
      Username: req.params.Username
    })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// app.get('/test-search/:data', (req, res) => {
//   let response = movies.filter(movie => movie.title.toLowerCase().includes(req.params.data.toLowerCase()))
// })

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});