// const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const config = require('./config')
const helpers = require('./helpers')
const keyboard = require('./keyboard')
const kb = require('./keyboard-btns')
const models = require('./models')
const bot = require('./bot')

/** Connecting for Mongo Database */
mongoose.connect(config.DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
.then(() => console.log('💾 Mongo DB. Connected...'))
.catch((err) => console.log('❌Mongo DB. Error', err))

bot.on('message', (msg) => {
  const chatId = helpers.getMessageChatId(msg);
  console.log('message', chatId, msg.text)
  switch (msg.text) {
    case kb.home.films:
      bot.sendMessage(chatId, 'Выберите жанр', {
        reply_markup: { keyboard: keyboard.films }
      })
      break;
    case kb.home.favorite:
      break;
    case kb.home.cimenas:
      break;
      case kb.film.action:
        helpers.sendsFilmsByQuery(chatId, { type: 'action' });
        break;
      case kb.film.comedy:
        helpers.sendsFilmsByQuery(chatId, { type: 'comedy' });
        break;
      case kb.film.random:
        helpers.sendsFilmsByQuery(chatId, {});
        break;
    case kb.back:
      bot.sendMessage(chatId, 'Что хотите посмотреть?', {
        reply_markup: { keyboard: keyboard.home }
      })
      break;
  }
})

bot.onText(/\/start/, (msg) => {
  const chatId = helpers.getMessageChatId(msg);
  const text = `Здравствуйте, ${msg.from.first_name}\nВыберите команду для начала работы:`
  bot.sendMessage(chatId, text, {
    reply_markup: { keyboard: keyboard.home }
  })
})
