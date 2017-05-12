const mongoose = require('mongoose');
const Film = require('./film.model')
// require('./models/cinema.model')
// require('./models/user.model')

// const Cinema = mongoose.model('cinemas')
// const User = mongoose.model('users')

/** Saving data in mongodb server from db.json */
// database.cinemas.forEach(c => new Cinema(c).save())
// database.films.forEach(f => new Film(f).save())

module.exports = {
  Film
}