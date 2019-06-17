var MongoClient = require('mongodb').MongoClient;
var database = undefined;
var dbUrl = 'mongodb://127.0.0.1:27017/app_data';
MongoClient.connect(dbUrl, {useNewUrlParser: true}, function (err, db) {
    if (err) {
        throw err;
    } else {
        database = db;
        console.log('MongoDB connection successful');
    }
});