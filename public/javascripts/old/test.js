var gplay = require('google-play-scraper');

gplay.categories().then(console.log);

gplay.list({
    category: gplay.category.GAME_FAMILY,
    collection: gplay.collection.TOP_FREE,
    num: 2
  })
  .then(console.log, console.log);
