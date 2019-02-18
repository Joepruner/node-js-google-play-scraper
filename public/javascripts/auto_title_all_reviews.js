const gplay = require('google-play-scraper');
const fs = require('fs');
const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson');
const sleep = require('sleep');

// var Promise = require("bluebird");
// import *from 'bluebird';

const fields = ['appTitle', 'userName', 'date', 'score', 'text'];

const opts = {
    'header': false
};

const json2csvParserTitles = new Json2csvParser();
const json2csvParserApps = new Json2csvParser();
const json2csvParserReviewsRest = new Json2csvParser(opts);
const json2csvParserReviewsFirst = new Json2csvParser({
    fields
});
// var titles_input_path = '../../input_data/SHORT_TEST_worst_app_titles.csv';
// var titles_input_path = '../../input_data/worst_app_titles.csv';
var titles_input_path = '../../input_data/SHORT_worst_mod_app_titles.csv';
var category_input_path = '../../input_data/short_app_category_list.csv';
var apps_output_path = '../../output_data/detailed_worst_apps.csv';
var reviews_output_path = '../../output_data/reviews_worst_apps.csv';

// var titles_input_path = '../../input_data/best_app_titles.csv';
// var apps_output_path = '../../output_data/detailed_top_free_apps.csv';
// var reviews_output_path = '../../output_data/reviews_top_free_apps.csv';

// var titles_input_stream = fs.createReadStream(titles_input_path, { encoding: 'utf8' });
var apps_output_stream = fs.createWriteStream(apps_output_path, {
    encoding: 'utf8'
});
var reviews_output_stream = fs.createWriteStream(reviews_output_path, {
    encoding: 'utf8',
    flags: 'a'
});

/**
 * Returns JSON array of full app details from the first (or more) search result(s),
 * based on the app title search term.
 * @param {string} at - The title of the app being searched for.
 */
var getAppDetails = function getAppDetails(at) { // sample async action
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.search({
            term: at['title'],
            num: 1,
            fullDetail: true,
            throttle: 10
        })), 300));
};

/**
 * Returns array of JSON for a single page of reviews for appId.
 * @param {string} aid - The app id to get reviews for.
 * @param {int} num - The review page number.
 * @param {string} appTitle - Used to add an appTitle field to the JSON obj
 * returned from gplay.reviews. NOT used for searching for app.
 */
var getAppReviews = function getAppReviews(aid, num, appTitle) {
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.reviews({
            appId: aid,
            page: num,
            sort: gplay.sort.NEWEST,
            throttle: 30
        }, appTitle)), 300));
};

csvtojson()
    .fromFile(titles_input_path)
    .then((titles) => {

        var pending_getAppDetails_promise = titles.map(getAppDetails);
        var resolved_getAppDetails_promise = Promise.all(pending_getAppDetails_promise);
        // console.log(titles);
        return resolved_getAppDetails_promise;
    }).then(function (appDetails) {
        // console.log(appDetails)
        var num_titles = Object.keys(appDetails).length;
        // console.log(num_titles);
        for (var i = 0; i < num_titles; i++) {
            var parsed_app_details = json2csvParserApps.parse(appDetails[i]);
            apps_output_stream.write(parsed_app_details);
        }

        var parsed_headers = json2csvParserReviewsFirst.parse();
        reviews_output_stream.write(parsed_headers);
        reviews_output_stream.write('\n');

        appDetails.forEach(app => {
            for (var i = 0; i < 5; i++) {
                if(i%2==0){
                    sleep.sleep(5);
                }
                getAppReviews(app[0].appId, i, app[0].appTitle).then(function (review) {
                    var parsed_app_reviews = json2csvParserReviewsRest.parse(review);
                    reviews_output_stream.write(parsed_app_reviews);
                    reviews_output_stream.write('\n');
                });
            }
        });
    });
