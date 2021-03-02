const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
  usernameField: 'userName',
  passwordField: 'passWord'
}, (userName, passWord, callback) => {
  console.log(userName + '  ' + passWord);
  Users.findOne({ userName: userName }, (error, users) => {
    if (error) {
      console.log(error);
      return callback(error);
    }

    if (!user) {
      console.log('incorrect userName');
      return callback(null, false, {message: 'Incorrect userName or passWord.'});
    }

    if (!user.validatePassword(passWord)) {
      console.log('incorrect password');
      return callback(null, false, {message: 'Incorrect password.'});
    }


    console.log('finished');
    return callback(null, users);
  });
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
  return Users.findById(jwtPayload._id)
    .then((users) => {
      return callback(null, users);
    })
    .catch((error) => {
      return callback(error)
    });
}));