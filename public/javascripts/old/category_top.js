const gplay = require('google-play-scraper');
const fs = require('fs');
// const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson');
const sleep = require('sleep');

// var Promise = require("bluebird");
// import *from 'bluebird';

const fields = ['appTitle', 'userName', 'date', 'score', 'text'];

const opts = {
    'header': false
};

const json2csvParserCategoryTitles = new Json2csvParser();
const json2csvParserApps = new Json2csvParser();
const json2csvParserReviewsRest = new Json2csvParser(opts);
const json2csvParserReviewsFirst = new Json2csvParser({
    fields
});
// var titles_input_path = '../../input_data/SHORT_TEST_worst_app_titles.csv';
//var titles_output_path = '/media/joepruner/SOUND BANK/DATA/node-js-google-play-scraper/titles_TOP_FREE_HEALTH_AND_FITNESS_apps.csv';
var titles_input_path = '/home/joepruner/Projects/GooglePlayScraper/input_data/titles.csv';
// var category_input_path = '../../input_data/short_app_category_list.csv';
// var apps_output_path = '../../output_data/detailed_worst_apps.csv';
var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/test_all_detailed_TOP_FREE_HEALTH_AND_FITNESS_apps.csv';
// var reviews_output_path = '../../output_data/reviews_worst_apps.csv';
var external_reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/test_newest_reveiws_TOP_FREE_HEALTH_AND_FITNESS_apps.csv';

// var titles_input_path = '../../input_data/category_app_titles.csv';
// var apps_output_path = '../../output_data/detailed_top_free_apps.csv';
// var reviews_output_path = '../../output_data/reviews_top_free_apps.csv';

// var titles_input_stream = fs.createReadStream(titles_input_path, { encoding: 'utf8' });
var apps_output_stream = fs.createWriteStream(external_apps_output_path, {
    encoding: 'utf8'
});
var reviews_output_stream = fs.createWriteStream(external_reviews_output_path, {
    encoding: 'utf8',
    flags: 'a'
});
// var category_titles_output_stream = fs.createWriteStream(titles_output_path, {
//     encoding: 'utf8',
//     flags: 'a'
// });

/**
 * Returns JSON array of full app details from the first (or more) search result(s),
 * based on the app title search term.
 * @param {string} at - The title of the app being searched for.
 */
var getAppDetails = function getAppDetails(at) { // sample async action
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.search({
            term: at.title,
            num: 1,
            fullDetail: true,
            throttle: 2
        })), 100));
};

/**
 * Returns array of JSON for a single page of reviews for appId.
 * @param {string} aid - The app id to get reviews for.
 * @param {int} num - The review page number.
 * @param {string} appTitle - Used to add an appTitle field to the JSON obj
 * returned from gplay.reviews. NOT used for searching for app.
 */
var getAppReviews = function getAppReviews(aid, num, appTitle, timeout) {
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.reviews({
            appId: aid,
            page: num,
            sort: gplay.sort.NEWEST,
            throttle: 3
        }, appTitle)), timeout));
};
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
//Write titles to CSV to read back in.

// var getAppTitlesByCategory = function getAppTitlesByCategory() {
//     return new Promise(resolve => setTimeout(() => resolve(
//         gplay.list({
//             category: gplay.category.HEALTH_AND_FITNESS,
//             collection: gplay.collection.TOP_FREE,
//             num: 10
//         }).then(function(appCategoryTitles){
//             var parsed_app_category_titles = json2csvParserCategoryTitles.parse(appCategoryTitles);
//             category_titles_output_stream.write(parsed_app_category_titles);
//             category_titles_output_stream.write('\n');
//         })),100));
// };
// getAppTitlesByCategory()



csvtojson()
    .fromFile(titles_input_path)
    .then((titles) => {
        console.log(titles);

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
        var review_page_count = 0;

        appDetails.forEach(app => {
            for (var i = 0; i < 112; i++) {

                if (i % 27 == 0) {
                    var rand = getRndInteger(1, 8);
                    console.log(i);
                    // console.log("Sleeping for " + rand + " seconds.");
                    sleep.sleep(rand);
                }
                getAppReviews(app[0].appId, i, app[0].title, i * 1.7 ).then(function (review) {
                    if (review.length < 1 || review == undefined) {
                        return false;
                    }

                    var parsed_app_reviews = json2csvParserReviewsRest.parse(review);
                    // console.log(parsed_app_reviews);
                    reviews_output_stream.write(parsed_app_reviews);
                    reviews_output_stream.write('\n');
                });
            }
        });
    });


// part1 with no sleep, throttle 40, timeout *1.25 36,161
// part1 with no sleep, throttle 20, timeout *1.25 45,801
// part1 with no sleep, throttle 10, timeout *1.25 49,280
// all with sleep, i%50 1-6, throttle 10, timout *1.25 -- 102,400
// all with sleep, i%50 1-6, throttle 5, timout *1.4 -- 102,440
// all with sleep, i%50 1-6, throttle 2, timout *2 -- 102,400
// all with sleep, i%35 1-6, throttle 3, timout *1.6 -- 102,795
// all with sleep, i%27 1-6, throttle 3, timout *1.7 -- 103,041 BOOM
// all with sleep, i%27 1-6, throttle 3, timout *1.7 -- 102,197
// all with sleep, i%27 1-6, throttle 3, timout *1.7 -- 102,117
// all with sleep, i%27 1-8, throttle 3, timout *1.7 -- 103,038 BOOM Helpfulness


//Total should be 103,040
