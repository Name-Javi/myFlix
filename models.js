const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthdate: Date,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 3);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

let movieSchema = mongoose.Schema({
    Title:{type: String, required: true},
    Description: {type: String, required: true},
    Genre: {
        Name:String,
        Description: String
    },
    Director: {
        Name: String,
    },
});



let Movie = mongoose.model('Movie', movieSchema);

let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User; 