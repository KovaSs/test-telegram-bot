const models = require('./models')
const keyboard = require('./keyboard')
const bot = require('./bot')

const helpers = {
  getMessageChatId(msg) {
    return msg.chat.id;
  },
  sendsFilmsByQuery(chatId, query) {
    models.Film.find(query).then(films => {
      const html = films.map((film, index) => (`<b>${index+1} ${film.name} /${film.uuid}</b>`)).join('\n')
      this.sendHTML(chatId, html, 'film')
    })
  },
  sendHTML(chatId, html, kbName = null) {
    const options = { parse_mode: 'HTML' };
    if (kbName) {
      options.reply_markup = keyboard[kbName]
    }
    return bot.sendMessage(chatId, html, options)
  }
}

module.exports = helpers
