const models = require('./models')
const keyboard = require('./keyboard')
const bot = require('./bot')

const helpers = {
  getMessageChatId(msg) {
    return msg.chat.id;
  },
  sendsFilmsByQuery(chatId, query) {
    models.Film.find(query).then(films => {
      const html = films.map((film, index) => (`<b>${index+1} ${film.name} /f${film.uuid}</b>`)).join('\n')
      this.sendHTML(chatId, html, 'film')
    })
  },
  sendHTML(chatId, html, kbName = null) {
    const options = { parse_mode: 'HTML' };
    if (kbName) {
      options.reply_markup = keyboard[kbName];
    }
    return bot.sendMessage(chatId, html, options);
  },
  /** Получение UUID */
  getItemUUid(sorce) {
    return sorce.substr(2, sorce.length);
  },
  /** Получение вильна по UUID */
  getFilmByUuid(chatId, filmId) { 
    models.Film.findOne({ uuid: filmId }).then( film => {
      const caption = 
        `Название: ${film.name}\n` + 
        `Год: ${film.year}\n` +
        `Рейтинг: ${film.rate}\n` +
        `Длительность: ${film.length}\n` +
        `Страна: ${film.country}\n`;

      bot.sendPhoto(chatId, film.picture, {
        caption,
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Добавить в избранное', callback_data: film.uuid },
              { text: 'Показать кинотеатры', callback_data: film.uuid },
            ],
            [
              { text: `Кинопоиск: ${film.name}`, url: film.link }
            ],
          ]
        }
      })
    })
  }
}

module.exports = helpers
