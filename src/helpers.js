const geolib = require('geolib')
const models = require('./models')
const keyboard = require('./keyboard')
const { ACTION_TYPE } = require('./constants')
const bot = require('./bot')
const { sortBy } = require('lodash')

const helpers = {
  /** Преобразование данных в строку  */
  stringifyData(data) {
    return JSON.stringify(data);
  },
  /** Преобразование данных из строки  */
  parseData(data) {
    return JSON.parse(data);
  },
  /** Получение chat.id при запросе  */
  getMessageChatId(msg) {
    return msg.chat.id;
  },
  /** Получение chat.id при запросе  */
  getMsgTelegramId(msg) {
    return msg.from.id;
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
  /** Поиск юзера по telegramId */
  getUser(telegramId) {
    return models.User.findOne({ telegramId })
  },
  /** Поиск фильма по chatId */
  getFilm(filmId) {
    return models.Film.findOne({ uuid: filmId })
  },
  /** Получение UUID */
  getItemUUid(sorce) {
    return sorce.substr(2, sorce.length);
  },
  /** Добавление или удаление фильма в избранное */
  toggleFavoriteFilm(userId, queryId, { filmUuid, isFav }) {
    let userPromise;
    this.getUser(userId).then(user => {
      if (user) {
        if (isFav) {
          user.films = user.films.filter(fUuid => fUuid !== filmUuid);
        } else {
          user.films.push(filmUuid);
        }
        userPromise = user;
      } else {
        userPromise = new models.User({ telegramId: userId, films: [filmUuid]});
      }
      userPromise.save().then(() => {
        const answerText = isFav ? 'Удалено' : 'Добавлено';
        bot.answerCallbackQuery(queryId, { text: answerText })
      })
    })
  },
  /** Получение фильна по UUID */
  getFilmByUuid(msg, filmId) {
    const chatId = this.getMessageChatId(msg);
    const telegramId = this.getMsgTelegramId(msg);

    Promise.all([
      this.getUser(telegramId),
      this.getFilm(filmId)
    ])
      .then(([user, film])=> {
        let isFav = false;

        if(user) {
          isFav = user.films.indexOf(film.uuid) !== -1;
        }

        const isFavText = isFav ? 'Удалить из избранного' : 'Добавить в избранное';

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
                { 
                  text: isFavText, 
                  callback_data: this.stringifyData({
                    type: ACTION_TYPE.TOGGLE_FAV_FILMS,
                    filmUuid: film.uuid,
                    isFav
                  })
                },
                { 
                  text: 'Показать кинотеатры', 
                  callback_data: this.stringifyData({ type: ACTION_TYPE.SHOW_CINEMAS, cinemaUuids: film.cinemas})
                },
              ],
              [{ text: `Кинопоиск: ${film.name}`, url: film.link }],
            ]
          }
        })
      })
  },
  /** Получение кинотеатра по UUID */
  getCinemaByUuid(chatId, cinemaId) { 
    models.Cinema.findOne({ uuid: cinemaId }).then( cinema => {
      bot.sendMessage(chatId, `Кинотеатр ${cinema.name}`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: cinema.name, url: cinema.url },
              { 
                text: 'Показать на карте', 
                callback_data: this.stringifyData({ 
                  type: ACTION_TYPE.SHOW_CINEMAS_MAP,
                  lat: film.location.latitude,
                  lot: film.location.longitude,
                })
              },
            ],
            [{ 
              text: 'Показать фильмы', 
              callback_data: this.stringifyData({
                type: ACTION_TYPE.SHOW_FILMS,
                filmsUuid: cinema.films,
              })
            }],
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
