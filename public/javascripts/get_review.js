var gplay = require('google-play-scraper');

gplay.reviews({
  appId: 'com.mojang.minecraftpe',
  page: 0,
  sort: gplay.sort.RATING
}).then(console.log, console.log);
