const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

let userSchema = mongoose.Schema({
    userName: {type: String, required: true},
    passWord: {type: String, required: true},
    Email: {type: String, required: true},
    birthDate: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (passWord) => {
  return bcrypt.hashSync(passWord, 10);
};

userSchema.methods.validatePassword = function(passWord) {
  return bcrypt.compareSync(passWord, this.passWord);
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