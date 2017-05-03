const TelegramBot = require('node-telegram-bot-api');
const config = require('./config')
const helpers = require('./helpers')
const keyboard = require('./keyboard')
const kb = require('./keyboard-btns')

helpers.botStarted()

const bot = new TelegramBot(config.TOKEN, {
  polling: true,
})

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
