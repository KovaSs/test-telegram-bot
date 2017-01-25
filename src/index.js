// const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const config = require('./config')
const helpers = require('./helpers')
const keyboard = require('./keyboard')
const { ACTION_TYPE } = require('./constants')
const kb = require('./keyboard-btns')
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
    case kb.home.cinemas:
      bot.sendMessage(chatId, 'Отправьте местоположение', {
        reply_markup: { keyboard: keyboard.cinemas }
      })
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

  if (msg.location) {
    helpers.getCinemasInCord(chatId, msg.location)
  }
})

bot.on('callback_query', ({ data }) => {
  const action = helpers.parseData(data)
  switch (action.type) {
    case ACTION_TYPE.SHOW_CINEMAS:
      console.log('SHOW_CINEMAS', action)
      break;
    case ACTION_TYPE.SHOW_CINEMAS_MAP:
      console.log('SHOW_CINEMAS_MAP', action)
      break;
    case ACTION_TYPE.TOGGLE_FAV_FILMS:
      console.log('TOGGLE_FAV_FILMS', action)
      break;
    case ACTION_TYPE.SHOW_FILMS:
      console.log('SHOW_FILMS', action)
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

bot.onText(/\/f(.+)/, (msg, [source, match]) => {
  const filmId = helpers.getItemUUid(source);
  helpers.getFilmByUuid(msg, filmId);
})

bot.onText(/\/c(.+)/, (msg, [source, match]) => {
  const chatId = helpers.getMessageChatId(msg);
  const cinemaId = helpers.getItemUUid(source);
  helpers.getCinemaByUuid(chatId, cinemaId);
})
