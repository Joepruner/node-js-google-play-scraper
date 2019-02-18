const gplay = require('google-play-scraper');
const fs = require('fs');
const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson');

var Promise = require("bluebird");
// import *from 'bluebird';

const fields = ['url', 'text', 'userName', 'date', 'score', 'scoreText'];

const json2csvParserTitles = new Json2csvParser();
const json2csvParserApps = new Json2csvParser();
const json2csvParserReviews = new Json2csvParser({
    fields
});
// var titles_input_path = '../../input_data/SHORT_TEST_worst_app_titles.csv';
var titles_input_path = '../../input_data/worst_app_titles.csv';
// var apps_output_path = '../../output_data/detailed_worst_apps.csv';
// var reviews_output_path = '../../output_data/reviews_worst_apps.csv';

// var titles_input_path = '../../input_data/best_app_titles.csv';
var apps_output_path = '../../output_data/detailed_top_free_apps.csv';
var reviews_output_path = '../../output_data/reviews_top_free_apps.csv';

// var titles_input_stream = fs.createReadStream(titles_input_path, { encoding: 'utf8' });
var apps_output_stream = fs.createWriteStream(apps_output_path, {
    encoding: 'utf8'
});
var reviews_output_stream = fs.createWriteStream(reviews_output_path, {
    encoding: 'utf8',
    flags: 'a'
});
// , flags: 'a'

var getAppDetails = function getAppDetails(at) { // sample async action
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.search({
            term: at['title'],
            num: 1,
            fullDetail: false,
            throttle: 10
        })), 100));
};


//Returns large array of the first page of reviews for each app.
var getAppReviews = function getAppReviews(aid) {
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.reviews({
            appId: aid['appId'],
            page: 5,
            sort: gplay.sort.NEWEST
        })), 100));
};

var getTopFreeApps = function getTopFreeApps() {
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.list({
            collection: gplay.collection.TOP_FREE,
            num: 39
        })), 100));
};

csvtojson()
    .fromFile(titles_input_path)
    .then((titles) => {
        var num_titles = Object.keys(titles).length;

        // var promises_app_details = titles.map(getAppDetails);
        // var resolved_promise_app_details = Promise.all(promises_app_details);
        getTopFreeApps().then(app_details => {
            for (var i = 0; i < 39; i++) {
                var parsed_app_details = json2csvParserApps.parse(app_details[i]);
                apps_output_stream.write(parsed_app_details);
            }

            var promises_app_reviews = app_details.map(getAppReviews);

            var resolved_promises_app_reviews = Promise.all(promises_app_reviews);
            return resolved_promises_app_reviews;
        }).then(app_reviews => {
            for (var i = 0; i < 39; i++) {
                var parsed_app_reviews = json2csvParserReviews.parse(app_reviews[i]);
                reviews_output_stream.write(parsed_app_reviews);
            }
        });
    });