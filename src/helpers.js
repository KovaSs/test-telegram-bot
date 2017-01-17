const geolib = require('geolib')
const models = require('./models')
const keyboard = require('./keyboard')
const bot = require('./bot')
const { sortBy } = require('lodash')

const helpers = {
  /** Получение chat.id при запросе  */
  getMessageChatId(msg) {
    return msg.chat.id;
  },
  /** Отправка фильпов по поисковым параметрам */
  sendsFilmsByQuery(chatId, query) {
    models.Film.find(query).then(films => {
      const html = films.map((film, index) => (`<b>${index+1} ${film.name} /f${film.uuid}</b>`)).join('\n')
      this.sendHTML(chatId, html, 'films')
    })
  },
  /** Вывод информации в telegram в виде html разметки */
  sendHTML(chatId, html, kbName = null) {
    const options = { parse_mode: 'HTML' };
    if (kbName) {
      options.reply_markup = {keyboard : keyboard[kbName]};
    }
    return bot.sendMessage(chatId, html, options);
  },
  /** Получение UUID */
  getItemUUid(sorce) {
    return sorce.substr(2, sorce.length);
  },
  /** Получение фильна по UUID */
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
            [{ text: `Кинопоиск: ${film.name}`, url: film.link }],
          ]
        }
      })
    })
  },
  /** Получение кинотеатров по координатам */
  getCinemasInCord(chatId, location) {
    models.Cinema.find({}).then(cinemas => {
      cinemas.forEach(c => c.distance = geolib.getDistance(location, c.location) / 1000)
      cinemas = sortBy(cinemas, 'distance')
      const html = cinemas.map((cinema, i) => 
        `<b>${i+1}</b> ${cinema.name}. <em>Расстояние</em> - <strong>${cinema.distance}</strong>км. /c${cinema.uuid}`
      ).join('\n');
      this.sendHTML(chatId, html, 'home')
    }).catch(err => console.log('err', err))
  },
}

module.exports = helpers;
