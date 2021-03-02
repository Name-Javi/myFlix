
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const bodyParser = require('body-parser');

const Movies = Models.Movie;
const Users = Models.User;


mongoose.connect('mongodb+srv://Javi:Jessilove19@cluster0.wbhpv.mongodb.net/myFlixDB?retryWrites=true&w=majority&ssl=true',{useNewUrlParser: true, useUnifiedTopology: true});

//mongoose.connect(process.env.CONNECTION_URI,{useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

app.use(morgan('common'));

app.use(express.static('public'));

app.use(bodyParser.json());

const passport = require('passport');
require('./passport.js');

const cors = require('cors');

let allowedOrigins = ['http://localhost:8080','https://javisolismyflix.herokuapp.com'];

app.use(cors({
	origin: (origin, callback) => {
		if(!origin) return callback(null, true);
		if(allowedOrigins.indexOf(origin) === -1){
			let message = 'The CORS policy for this application does not allow access from origin ' + origin;
			return callback(new Error(message), false);
		}
		return callback (null, true);
	}
}));

let auth = require('./auth')(app);

const { check, validationResult } = require('express-validator');

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
app.get('/movies',  (req, res) => {
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
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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


//Get list of users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
  .then((users) => {
      res.status(201).json(users);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//Get user info based on userName
app.get('/users/:userName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ userName: req.params.userName })
  .then((user) => {
      res.json(user);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

// Let users update their user info based on userName
app.put('/users/:userName',
	[
		check('userName', 'userName is required').isLength({min: 5}),
		check('userName', 'userName contains non-alphanumeric characters — not allowed.').isAlphanumeric(),
		check('passWord', 'Password is required').not().isEmpty(),
		check('Email', 'Email does not appear to be valid.').isEmail()
	], (req, res) => {
			
	// Checks validation object for errors
	let errors = validationResult(req);
	
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	
	let hashedPassword = Users.hashPassword(req.body.passWord);

  Users.findOneAndUpdate({ userName: res.params.userName },
  { $set:
      {
          userName: req.body.userName,
          passWord:hashedPassword,
          Email: req.body.Email,
          birthDate: req.body.birthDate
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
app.post('/users/:userName/favorites/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ userName: req.params.userName }, 
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
  check('userName', 'userName is required').isLength({min: 5}),
  check('userName', 'userName contains non-alphanumeric characters — not allowed.').isAlphanumeric(),
  check('passWord', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid.').isEmail()
], (req, res) => {

  // Checks validation object for errors
	let errors = validationResult(req);
	
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

  let hashedPassword = Users.hashPassword(req.body.passWord);

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
            passWord: hashedPassword,
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
app.delete('/users/:userName/favorites/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ userName: req.params.userName }, 
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

// Delete a user by userName
app.delete('/users/:userName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({
      userName: req.params.userName
    })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.userName + ' was not found');
      } else {
        res.status(200).send(req.params.userName + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});