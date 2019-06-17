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