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
  /** Поиск фильма по chatId */
  getFilmsList(searchParams) {
    return models.Film.find({ uuid: searchParams })
  },
  /** Поиск фильма по chatId */
  getCinemaList(searchParams) {
    return models.Cinema.find({ uuid: searchParams })
  },
  /** Получение UUID */
  getItemUUid(sorce) {
    return sorce.substr(2, sorce.length);
  },
  /** Отображение списка кинотеатров в которых показывается фильм */
  showCinemasByQuery(userId, cinemaUuids) {
    this.getCinemaList({'$in': cinemaUuids}).then((cinemas) => {
      const html = cinemas.map((c, i) => `<b>${i+1}</b> ${c.name} - (/c${c.uuid})`).join('\n');
      this.sendHTML(userId, html, 'home');
    })
  },
  /** Отображение списка фильмов добавленных в избранное */
  showFavouriteFilms(chatId, userId) {
    this.getUser(userId).then(async(user) => {
      let html = 'Вы пока ничего не добавили';
      if (user) {
        await this.getFilmsList({'$in': user.films}).then(films => {
          if (films.length) {
            html = films.map((f, i) => `<b>${i+1}</b> ${f.name} <b>${f.rate}</b> - (/f${f.uuid})`).join('\n');
          }
        })
      }
      this.sendHTML(chatId, html, 'home');
    })
  },
  /** Добавление или удаление фильма в избранное */
  toggleFavouriteFilm(userId, queryId, { filmUuid, isFav }) {
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
                  lat: cinema.location.latitude,
                  lot: cinema.location.longitude,
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
