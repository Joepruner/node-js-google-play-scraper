// var mongoose = require('mongoose');

// mongoose.connect("mongodb://127.0.0.1:27017/app_data", {
//   useNewUrlParser: true
// });

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//   console.log("Connected to MongoDB!");
//   var app_review_schema = new mongoose.Schema({
//     _id: [{
//       $oid: String
//     }],
//     appTitle: String,
//     appGenre: String,
//     userName: String,
//     date: String,
//     score: Number,
//     text: String,
//     appId: String,
//     scrape_set: String,
//     hash: String
//   })

//   var app_review_schema = new mongoose.Schema({
//     _id: [{
//       $oid: String
//     }],
//     title: String,
//     installs: String,
//     minInstalls: Number,
//     scoreText: String,
//     ratings: Number,
//     reviews: Number,
//     histogram: {
//       1: Number,
//       2: Number,
//       3: Number,
//       4: Number,
//       5: Number
//     },
//     price: Number,
//     free: Boolean,
//     currency: String,
//     priceText: String,
//     offersIAP: Boolean,
//     size: String,
//     androidVersion: String,
//     androidVersionText: String,
//     developer: String,
//     developerId: String,
//     genreId: String,
//     familyGenreId: String,
//     contentRating: String,
//     adSupported: Boolean,
//     released: String,
//     updated: Number,
//     version: String,
//     recentChanges: String,
//     appId: String,
//     url: String,
//     scrape_set: String,
//     hash: String

//   });

// });






var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/app_data";

MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
  if (err) throw err;
  console.log("Database created!");
  var dbo = db.db("app_data");
  dbo.createCollection("app_details", function (err, res) {
    if (err) throw err;
    console.log("Collection app_details created!");
  })
  dbo.createCollection("app_reviews", function (err, res) {
    if (err) throw err;
    console.log("Collection app_reviews created!");
    db.close();
  })
});