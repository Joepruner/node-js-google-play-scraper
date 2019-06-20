var simple_pp_lt3w_rnascii = require("./pre_proc_functions/simple_pp_lt3w_rnascii.js")

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/app_data";

const Json2csvParser = require('json2csv').Parser;
const fs = require('fs');

const opts = {
    'header': false
};

var fields = ['mongoID', 'appTitle', 'appId', 'appGenre', 'scrapeSet', 'userName', 'date', 'score', 'reviewTitle', 'text', 'replyDate', 'replyText', 'hash'];
const json2csvParserReviewsHeader = new Json2csvParser({
    fields
});
const json2csvParserReviewsRest = new Json2csvParser(opts);

var fields = ['title', 'installs', 'minInstalls', 'scoreText', 'ratings', 'reviews', 'price', 'free',
    'currency', 'priceText', 'offersIAP', 'size', 'androidVersion', 'androidVersionText', 'developer',
    'developerId', 'genreId', 'familyGenreId', 'contentRating',
    'adSupported', 'released', 'updated', 'version', 'recentChanges', 'appId', 'hash'
];

const json2csvParserAppFullDetailHeader = new Json2csvParser({
    fields
});

const json2csvParserAppFullDetailRest = new Json2csvParser({
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
    console.log("Connected to database!");
    var dbo = db.db("app_data");

    /*********************DETAILS************************* */
    var app_details = dbo.collection('app_details');

    var apps_output_stream = fs.createWriteStream(app_details_output_path + '_from_MongoDB.csv', {
        encoding: 'utf8',
        flags: 'a'
    });

    var parsed_detail_headers = json2csvParserAppFullDetailHeader.parse();
    apps_output_stream.write(parsed_detail_headers);
    apps_output_stream.write('\n');

    console.log("Writing app details to .csv");
    app_details.find().forEach(function (doc) {
        
        var parsed_app_detail = json2csvParserAppFullDetailRest.parse(doc);
        // var parsed_app_detail.
        apps_output_stream.write(parsed_app_detail.toLowerCase());
        apps_output_stream.write('\n');
    }, function () {
        apps_output_stream.close();
        console.log("Done");
    });


    /********************REVIEWS**************** */

    var app_reviews = dbo.collection('app_reviews');

    var reviews_output_stream = fs.createWriteStream(reviews_output_path + '_from_MongoDB.csv', {
        encoding: 'utf8',
        flags: 'a'
    });

    var parsed_headers = json2csvParserReviewsHeader.parse();
    reviews_output_stream.write(parsed_headers);
    reviews_output_stream.write('\n');

    console.log("Writing app reviews to .csv");
    app_reviews.find().forEach(function (doc) {
        // console.log(doc.text);
        if (simple_pp_lt3w_rnascii.is_lt3_words(doc.text)) {

        } else {
            var parsed_app_review = json2csvParserReviewsRest.parse(doc);
            var parsed_app_review = parsed_app_review.toLowerCase();
            reviews_output_stream.write(parsed_app_review);
            reviews_output_stream.write('\n');
        }
    }, function () {
        reviews_output_stream.close();
        console.log("Done");
    });
    db.close();
});

