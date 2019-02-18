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
// var titles_input_path = '../../input_data/worst_app_titles.csv';
var titles_input_path = '../../input_data/worst_18_app_titles.csv';
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
// , flags: 'a'

/**
 *
 * @todo 1-- Iterate through categories w/ gplay.list and return array of top 5 apps
 * for each category with full details. Write to csv WITH CATEGORY.
 * @todo 2-- Using the appId's from step 1, get reviews for that app...
 * @todo 3-- Do not move to the next appId untill ALL PAGES of reviews for that app
 * are retreived. Iterate through all pages, and safely halt after last page.
 */


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
            fullDetail: false,
            throttle: 10
        })), 100));
};

/**
 * Returns array of JSON for a single page of reviews for appId.
 * @param {string} aid - The app id to get reviews for.
 */
var getAppReviews = function getAppReviews(aid, num) {
    // console.log(at['title']);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.reviews({
            appId: aid,
            page: num,
            sort: gplay.sort.NEWEST
        })), 300));
};

var getTopFromCategory = function getTopFromCategory(cat) {
    // console.log(cat);
    return new Promise(resolve => setTimeout(() => resolve(
        gplay.list({
            category: cat.category,
            num: 5,
            fullDetail: true
        })), 300));

};

csvtojson()
    .fromFile(titles_input_path)
    .then((titles) => {

        var pending_getTop5Category_promise = categories.map(getTopFromCategory);
        var resolved_getTop5Category_promise = Promise.all(pending_getTop5Category_promise);
        console.log(categories);
        return resolved_getTop5Category_promise;
    }).then(function (topFromCategory) {
        // console.log(topFromCategory)
        var pending_single_page_app_reviews = [];
        // topFromCategory.forEach(app => {
            // console.log(app['appId']);
            for (var i = 0; i < 100; i++) {
            getAppReviews('com.sds.emm.cloud.knox.samsung', i).then(function(review) {
                var parsed_app_reviews = json2csvParserReviews.parse(review);
                reviews_output_stream.write(parsed_app_reviews);
            });
            }
        // });
    });


    // app[0]['appId'],



// var num_titles = Object.keys(titles).length;

// // var promises_app_details = titles.map(getAppDetails);
// // var resolved_promise_app_details = Promise.all(promises_app_details);
// getTopFreeApps().then(app_details => {
//     for (var i = 0; i < 39; i++) {
//         var parsed_app_details = json2csvParserApps.parse(app_details[i]);
//         // apps_output_stream.write(parsed_app_details);
//     }

//     var promises_app_reviews = app_details.map(getAppReviews);

//     var resolved_promises_app_reviews = Promise.all(promises_app_reviews);
//     return resolved_promises_app_reviews;
// }).then(app_reviews => {
//     for (var i = 0; i < 39; i++) {
//         var parsed_app_reviews = json2csvParserReviews.parse(app_reviews[i]);
//         // reviews_output_stream.write(parsed_app_reviews);
//     }
// });