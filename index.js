
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

app.use(express.json());

const passport = require('passport');
require('./passport.js');

const cors = require('cors');

let allowedOrigins = ['https://javisflix.netlify.app/','http://localhost:1234','https://javisolismyflix.herokuapp.com'];

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
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
console.log(process.env.CONNECTION_URI);

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

//Get user info based on Username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
  .then((user) => {
      res.json(user);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

// Let users add a movie to their favorites
app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, 
  { $push: { favoriteMovies: req.params.MovieID }},
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
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non-alphanumeric characters — not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid.').isEmail()
], (req, res) => {

  // Checks validation object for errors
	let errors = validationResult(req);
	
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

  let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOne({
      Username: req.body.Username
    })
    .then(users => {
      if (users) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthdate: req.body.Birthdate
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

// Let users update their user info based on Username
app.put('/users/:Username',
	[
		check('Username', 'Username is required').isLength({min: 5}),
		check('Username', 'Username contains non-alphanumeric characters — not allowed.').isAlphanumeric(),
		check('Password', 'Password is required').not().isEmpty(),
		check('Email', 'Email does not appear to be valid.').isEmail()
	], (req, res) => {
			
	// Checks validation object for errors
	let errors = validationResult(req);
	
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}
	
	let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOneAndUpdate({ Username: req.params.Username },
  { $set:
      {
          Username: req.body.Username,
          Password:hashedPassword,
          Email: req.body.Email,
          Birthdate: req.body.Birthdate
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

// Let users remove movie from their favorites
app.use(express.json());
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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

// Delete a user by Username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});