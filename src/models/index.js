const mongoose = require('mongoose');
const config = require('../config')
require('./film.model')
// require('./models/cinema.model')
// require('./models/user.model')

const Film = mongoose.model('films')
// const Cinema = mongoose.model('cinemas')
// const User = mongoose.model('users')

/** 
 * saving data in mongodb server from db.json
 */
// database.cinemas.forEach(c => new Cinema(c).save())
// database.films.forEach(f => new Film(f).save())

mongoose.connect(config.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
.then(() => console.log('💾 Mongo DB. Connected...'))
.catch((err) => console.log('❌Mongo DB. Error', err))