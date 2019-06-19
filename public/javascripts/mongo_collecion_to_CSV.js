var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/app_data";

const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

const opts = {
    'header': false
};

var fields = ['mongoID','appTitle', 'appId', 'appGenre', 'userName', 'date', 'score', 'reviewTitle', 'text', 'replyDate', 'replyText'];
const json2csvParserReviewsFirst = new Json2csvParser({
    fields
});
const json2csvParserReviewsRest = new Json2csvParser(opts);

var fields = ['title', 'installs', 'minInstalls', 'scoreText', 'ratings', 'reviews', 'price', 'free',
    'currency', 'priceText', 'offersIAP', 'size', 'androidVersion', 'androidVersionText', 'developer',
    'developerId', 'genreId', 'familyGenreId', 'contentRating',
    'adSupported', 'released', 'updated', 'version', 'recentChanges', 'appId'
];

const json2csvParserAppFullDetailsFirst = new Json2csvParser({
    fields
});

const json2csvParserAppFullDetailsRest = new Json2csvParser({
    'header': false,
    fields
});

var today = new Date();
var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

var app_details_output_path = '/home/joseph/Projects/GooglePlayScraper/output_data/pre_processing_apps/' + date + '_app_details';
var reviews_output_path = '/home/joseph/Projects/GooglePlayScraper/output_data/pre_processing_apps/' + date + '_reviews';


MongoClient.connect(url, {
    useNewUrlParser: true
}, function (err, db) {
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("app_data");

    /*********************DETAILS************************* */
    var app_details = dbo.collection('app_details');

    var apps_output_stream = fs.createWriteStream(app_details_output_path + '_from_MongoDB.csv', {
        encoding: 'utf8',
        flags: 'a'
    });

    var parsed_detail_headers = json2csvParserAppFullDetailsFirst.parse();
    apps_output_stream.write(parsed_detail_headers);
    apps_output_stream.write('\n');

    app_details.find().forEach(function (doc) {
        var parsed_app_details = json2csvParserAppFullDetailsRest.parse(doc);
        apps_output_stream.write(parsed_app_details);
        apps_output_stream.write('\n');
    }, function () {
        apps_output_stream.close();
    });


    /********************REVIEWS**************** */

    var app_reviews = dbo.collection('app_reviews');

    var reviews_output_stream = fs.createWriteStream(reviews_output_path + '_from_MongoDB.csv', {
        encoding: 'utf8',
        flags: 'a'
    });

    var parsed_headers = json2csvParserReviewsFirst.parse();
    reviews_output_stream.write(parsed_headers);
    reviews_output_stream.write('\n');

    app_reviews.find().forEach(function (doc) {
        var parsed_app_reviews = json2csvParserReviewsRest.parse(doc);
        reviews_output_stream.write(parsed_app_reviews.t);
        reviews_output_stream.write('\n');
    }, function () {
        reviews_output_stream.close();
    });

});