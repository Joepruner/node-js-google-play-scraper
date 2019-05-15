const gplay = require('google-play-scraper');
const fs = require('fs');
// const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson');
const sleep = require('sleep');

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
var today = new Date();

var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

// var titles_input_path = '/home/joepruner/Projects/GooglePlayScraper/input_data/categories(8)_all_titles_NO_SEP.csv';
var titles_input_path = '/home/joepruner/Projects/GooglePlayScraper/input_data/worst_mod_app_titles.csv';

// var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/' + date + '_app_details_TOP_FREE_';
var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/worst_power_consumption_apps/' + date + '_all_details_worst_';

// var external_reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/' + date + '_newest_reveiws_TOP_FREE_';
var external_reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/worst_power_consumption_apps/' + date + '_newest_reveiws_worst_';



/**
 * Returns JSON array of full app details from the first (or more) search result(s),
 * based on the app title search term.
 * @param {string} at - The title of the app being searched for.
 */
var getAppDetails = function getAppDetails(at) { // sample async action
    // console.log(at['title']);
    try {
        return new Promise(resolve => setTimeout(() => resolve(
            gplay.search({
                term: at.title,
                num: 1,
                fullDetail: true,
                throttle: 3
            })), 100));
    } catch (err) {
        console.log("Error inside getAppDetails" + err);
    }
};

var getAppFullDetails = function getAppFullDetails(aid) {
    try {
        return new Promise(resolve => setTimeout(() => resolve(
            gplay.app({
                appId: aid
            }))));
    } catch (err) {
        console.log("Error inside getAppFullDetails" + err);
    }
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
    try {
        return new Promise(resolve => setTimeout(() => resolve(
            gplay.reviews({
                appId: aid,
                page: num,
                sort: gplay.sort.NEWEST,
                throttle: 3
            }, appTitle)), 60000));
    } catch (err) {
        console.log("Error inside getAppReviews" + err);
    }
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
//Write titles to CSV to read back in.

// var getAppTitlesByCategory = function getAppTitlesByCategory() {'/home/joepruner/Projects/GooglePlayScraper/output_data/test_newest_reveiws_TOP_FREE_HEALTH_AND_FITNESS_apps.csv'
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

try {
    csvtojson()
        .fromFile(titles_input_path)
        .then((titles) => {
            console.log(titles);
            try {
                var pending_getAppDetails_promise = titles.map(getAppDetails);
                var resolved_getAppDetails_promise = Promise.all(pending_getAppDetails_promise);
                // console.log(titles);
                return resolved_getAppDetails_promise;
            } catch (err) {
                console.log("Error in getAppDetails: " + err);
            }
        }).then(function (appDetails) {
            // var num_titles = Object.keys(appDetails).length;
            appDetails.forEach(app => {
                // sleep.sleep(15);
                try {
                    getAppFullDetails(app[0].appId).then(function (fullDetails) {
                        var apps_output_stream = fs.createWriteStream(external_apps_output_path + fullDetails.genreId + '_apps.csv', {
                            encoding: 'utf8',
                            flags: 'a'
                        });
                        var parsed_app_details = json2csvParserApps.parse(app);
                        apps_output_stream.write(parsed_app_details);
                        apps_output_stream.close();
                        return fullDetails;
                    }).then((fullDetails) => {

                        for (var i = 0; i < 112; i++) {

                            // if (i % 27 == 0) {
                            //     var rand = getRndInteger(1, 8);
                            //     console.log(i);
                            //     // console.log("Sleeping for " + rand + " seconds.");
                            //     sleep.sleep(rand);
                            // }
                            try {
                                getAppReviews(app[0].appId, i, app[0].title).then(function (review) {
                                    if (review.length < 1 || review == undefined) {
                                        return false;
                                    }

                                    var reviews_output_stream = fs.createWriteStream(external_reviews_output_path + fullDetails.genreId + '_apps.csv', {
                                        encoding: 'utf8',
                                        flags: 'a'
                                    });

                                    // try {
                                    if (fs.existsSync(external_reviews_output_path + fullDetails.genreId + '_apps.csv')) {

                                    } else {
                                        var parsed_headers = json2csvParserReviewsFirst.parse();
                                        reviews_output_stream.write(parsed_headers);
                                        reviews_output_stream.write('\n');
                                    }
                                    // } catch (err) {

                                    // }

                                    var parsed_app_reviews = json2csvParserReviewsRest.parse(review);
                                    // console.log(parsed_app_reviews);
                                    reviews_output_stream.write(parsed_app_reviews);
                                    reviews_output_stream.write('\n');
                                    reviews_output_stream.close();
                                });
                            } catch (err) {
                                console.log("Error in getAppReviews: " + err);
                            }
                        }
                    });
                } catch (err) {
                    console.log("Error in getAppFullDetails: " + err);
                }
            });
        });
} catch (err) {
    console.log("Error in main function: " + err);
}


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