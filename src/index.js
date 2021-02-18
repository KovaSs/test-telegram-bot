const TelegramBot = require('node-telegram-bot-api');
const config = require('./config')
const helpers = require('./helpers')

helpers.botStarted()

const bot = new TelegramBot(config.TOKEN, {
  polling: true,
})


bot.on('message', (msg) => {
  console.log('Working', msg)
})