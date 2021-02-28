const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  telegramId: { type: Number, required: true },
  first_name: { type: String },
  last_name: { type: String },
  username: { type: String },
  films: { type: [String], default: [] }
})

module.exports = mongoose.model('users', UserSchema);
