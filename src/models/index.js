const Film = require('./film.model')
const Cinema = require('./cinema.model')

// Saving data in mongodb server from db.json
// const db = require('../../db.json')
// db.cinemas.forEach(c => new Cinema(c).save())
// db.films.forEach(f => new Film(f).save())

module.exports = {
  Film,
  Cinema,
}