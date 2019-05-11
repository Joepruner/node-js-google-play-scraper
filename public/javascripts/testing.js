const gplay = require('google-play-scraper');
const fs = require('fs');
// const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson');
const sleep = require('sleep');

gplay.search({
    term: "google",
    num: 2,
    }).then(console.log, console.log);


// gplay.app({appId: 'com.playgendary.ktb2'})
//   .then(console.log, console.log);

// gplay.list({
//     category: gplay.category.GAME_ACTION,
//     collection: gplay.collection.TOP_FREE,
//     num: 2
//   })
//   .then(console.log, console.log);