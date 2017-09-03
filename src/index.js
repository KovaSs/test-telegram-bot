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
  console.log('Working', msg)
  switch (msg.text) {
    case kb.home.films:
      break;
    case kb.home.favorite:
      break;
    case kb.home.cimenas:
      break;
  }
})

bot.onText(/\/start/, (msg) => {
  const id = helpers.getMessageChatId(msg);
  const text = `Здравствуйте, ${msg.from.first_name}\nВыберите команду для начала работы:`
  bot.sendMessage(id, text, {
    reply_markup: {
      keyboard: keyboard.home
    }
  })
})
