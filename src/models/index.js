const Film = require('./film.model')
const Cinema = require('./cinema.model')
const db = require('../../db.json')

// Saving data in mongodb server from db.json
// db.cinemas.forEach(c => new Cinema(c).save())
// db.films.forEach(f => new Film(f).save())

module.exports = {
  Film,
  Cinema,
}