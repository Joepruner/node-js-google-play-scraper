const gplay = require('google-play-scraper');
const fs = require('fs');
const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson')

const fields = ['url', 'text', 'userName', 'date', 'score', 'scoreText'];

const json2csvParserTitles = new Json2csvParser();
const json2csvParserApps = new Json2csvParser();
const json2csvParserReviews = new Json2csvParser({ fields });
// var titles_input_path = '../../input_data/SHORT_TEST_worst_app_titles.csv';
var titles_input_path = '../../input_data/worst_app_titles.csv';
var apps_output_path = '../../output_data/detailed_worst_apps.csv';
var reviews_output_path = '../../output_data/reviews_worst_apps.csv';

// var titles_input_stream = fs.createReadStream(titles_input_path, { encoding: 'utf8' });
var apps_output_stream = fs.createWriteStream(apps_output_path, { encoding: 'utf8' });
var reviews_output_stream = fs.createWriteStream(reviews_output_path, { encoding: 'utf8', flags: 'a' });
// , flags: 'a'

var app_data = function getAppData(at) { // sample async action
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.search({
            term: at['title'],
            num: 1,
            fullDetail: false,
            throttle: 10
        })), 100));
};

var app_ids = function getAppIds(aid) {
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.reviews({
            appId: aid[0]['appId'],
            page: 0,
            sort: gplay.sort.NEWEST
        })), 100));
};

csvtojson()
    .fromFile(titles_input_path)
    .then((titles) => {
        var num_titles = Object.keys(titles).length;

        var app_details = titles.map(app_data);
        // app_details.then(console.log);
        var results = Promise.all(app_details);
        // console.log(results);
        results.then(data => {
            // console.log(data);
            for (var i = 0; i < 5; i++) {
                var apps = json2csvParserApps.parse(data[i]);
                apps_output_stream.write(apps);
            }
            var reviews = data.map(app_ids);
            var review_results = Promise.all(reviews);

            return review_results;
        }).then(data => {
            for (var i = 0; i < 5; i++) {
                var csv_reviews = json2csvParserReviews.parse(data[i]);
                reviews_output_stream.write(csv_reviews);
                // console.log(csv_reviews);
            }
        });
    });