const mongoose = require('mongoose');

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

let userSchema = mongoose.Schema({
    userName: {type: String, required: true},
    passWord: {type: String, required: true},
    Email: {type: String, required: true},
    birthDate: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);

let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User; 