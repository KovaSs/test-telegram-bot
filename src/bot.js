const TelegramBot = require('node-telegram-bot-api');
const config = require('./config')

const bot = new TelegramBot(config.TOKEN, {
  polling: true,
})

console.log('🚀Bot: Has been started...')

module.exports = bot
