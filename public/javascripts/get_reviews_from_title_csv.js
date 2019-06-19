const gplay = require('google-play-scraper');
const fs = require('fs');
const md5 = require('md5');
const path = require('path');
const directoryPath = path.join(__dirname, '..', '..', 'input_data', 'pre_processing_apps/');

const _cliProgress = require('cli-progress');
const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

const Json2csvParser = require('json2csv').Parser;
const csvtojsonV2 = require('csvtojson/v2');
// const reorder = require('csv-reorder');
// const v8 = require('v8');

var http = require('http');
var https = require('https');

http.globalAgent.maxSockets = 1;
https.globalAgent.maxSockets = 1;

const sleep = require('sleep');

const opts = {
    'header': false
};

var fields = ['appTitle', 'appId', 'appGenre', 'userName', 'date', 'score', 'reviewTitle', 'text', 'replyDate', 'replyText'];
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

var sort_type = [gplay.sort.NEWEST];
// , gplay.sort.HELPFULNESS, gplay.sort.RATING];

var today = new Date();

var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

var app_details_output_path = '/home/joseph/Projects/GooglePlayScraper/output_data/pre_processing_apps/' + date + '_app_details';
var reviews_output_path = '/home/joseph/Projects/GooglePlayScraper/output_data/pre_processing_apps/' + date + '_reviews';

/**
 * Returns JSON array of basic app details from the first (or more) search result(s),
 * based on the app title search term.
 * @param {string} at - The title of the app being searched for.
 * NOTE: currently the "fullDetail" option is not working for gplay.search() so
 * that is why the getAppFullDetails -> gplay.app() function is needed.
 * gplay.search() will get the appId, and use that in gplay.app() to get full details.
 */
var getAppDetails = (at) => ( // sample async action
    gplay.search({
        term: at.title,
        num: 1,
        // fullDetail: true,
        throttle: 1
    }).catch(function (err) {
        console.log("The app " + at + " is undefined. App may have changed or been removed. " + err);
    })
);

/**
 *Retrieves the fully detailed app information.
 * @param {*} aid - The app id to search with.
 */
var getAppFullDetails = (aid) => (
    gplay.app({
        appId: aid,
        throttle: 1
    }).catch(function (err) {
        console.log("The app " + aid + " is undefined. App may have changed or been removed." + err);
    })
);

/**
 * Returns array of JSON for a single page of reviews for appId.
 * @param {string} aid - The app id to get reviews for.
 * @param {int} num - The review page number.
 * @param {string} appTitle - Used to add an appTitle field to the JSON obj
 * returned from gplay.reviews. NOT used for searching for app.
 */
var getAppReviews = (aid, num, appTitle, appGenre, scrape_set) => (
    gplay.reviews({
        appId: aid,
        page: num,
        sort: gplay.sort.NEWEST,
        throttle: 1
    }, appTitle, aid, appGenre, scrape_set).catch(function (err) {
        console.log("Review error for app " + appTitle + " on page " + num + ". " + err);
    })
);

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var getAppReviewsFromCSV = function getAppReviewsFromCSV(file, dbo) {
    console.log("Processing " + file);

    csvtojsonV2()
        .fromFile(directoryPath + file)
        .then((titles) => {
            var pending_getAppDetails_promise = titles.map(getAppDetails);
            return pending_getAppDetails_promise;

        }).then(function (pending_getAppDetails_promise) {
            var resolved_getAppDetails_promise = Promise.all(pending_getAppDetails_promise);
            return resolved_getAppDetails_promise;

        }).then(function (appDetails) {
            appDetails.forEach(app => {
                getAppFullDetails(app[0].appId).then(function (fullDetails) {
                    var price_collection;

                    try {
                        if (fullDetails.free == true) {
                            price_collection = 'FREE';
                        } else if (fullDetails.free == false) {
                            price_collection = 'PAID';
                        }
                    } catch (err) {
                        console.log('Error getting fullDetails.free for ' + app[0].title + " : " + err);
                    }
                    var file_name = JSON.stringify(file);
                    var scrape_set = '';

                    if (file_name.includes('category') && file_name.includes('topselling')) {
                        scrape_set = '_by_category_topselling';
                    } else if (file_name.includes('worst')) {
                        scrape_set = '_by_worst_battery'
                    } else {
                        scrape_set = '_scrape_set_unknown';
                    }

                    var file_name = JSON.stringify(file);
                    var apps_output_stream = fs.createWriteStream(app_details_output_path + scrape_set + "_" + 'NEWEST_' + price_collection + '.csv', {
                        encoding: 'utf8',
                        flags: 'a'
                    });

                    if (fs.existsSync(app_details_output_path + scrape_set + "_" + 'NEWEST_' + price_collection + '.csv')) {

                    } else {
                        var parsed_detail_headers = json2csvParserAppFullDetailsFirst.parse();
                        apps_output_stream.write(parsed_detail_headers);
                        apps_output_stream.write('\n');
                    }

                    fullDetails.scrape_set = scrape_set;
                    fullDetails.appId = app[0].appId;

                    var hash = md5(fullDetails.appId + fullDetails.updated);
                    fullDetails.hash = hash;

                    dbo.collection("app_details").insertOne(fullDetails, function (err, res) {
                        if (err) throw err;
                    });

                    var parsed_app_details = json2csvParserAppFullDetailsRest.parse(fullDetails);
                    apps_output_stream.write(parsed_app_details);
                    apps_output_stream.write('\n');
                    apps_output_stream.close();

                    for (var i = 0; i < 1; i++) {

                        if (i % 15 == 0) {
                            var rand = getRndInteger(1, 3);
                            sleep.sleep(rand);

                            var file_name = JSON.stringify(file);
                            var scrape_set = '';

                            if (file_name.includes('category') && file_name.includes('topselling')) {
                                scrape_set = '_by_category_topselling';
                            } else if (file_name.includes('worst')) {
                                scrape_set = '_by_worst_battery'
                            } else {
                                scrape_set = '_scrape_set_unknown';
                            }
                        }

                        getAppReviews(app[0].appId, i, app[0].title, fullDetails.genreId, scrape_set).then(function (reviews) {
                            // if (review == undefined || review.length < 1) {
                            //     console.log("Error on review page " + i + " for app " + app[0].title +
                            //         ". Probably reached end of review pages for this app.");
                            //     return;
                            // }

                            /** DATABASE insertion of reviews
                             * @rev individual review from the array "reviews"
                             ******************************************************************************/
                            reviews.forEach(function (review) {
                                var hash = md5(review.appId + review.userName + review.text);
                                review.hash = hash;
                                dbo.collection("app_reviews").insertOne(review, function (err, res) {
                                    if (err) throw err;
                                });
                            })

                            /**
                             * .CSV output of reviews
                             ****************************************************************************/

                            var reviews_output_stream = fs.createWriteStream(reviews_output_path + scrape_set + "_" + 'NEWEST_' + price_collection + '.csv', {
                                encoding: 'utf8',
                                flags: 'a'
                            });

                            if (fs.existsSync(reviews_output_path + scrape_set + "_" + 'NEWEST_' + price_collection + '.csv')) {

                            } else {
                                var parsed_headers = json2csvParserReviewsFirst.parse();
                                reviews_output_stream.write(parsed_headers);
                                reviews_output_stream.write('\n');
                            }

                            var parsed_app_reviews = json2csvParserReviewsRest.parse(reviews);
                            reviews_output_stream.write(parsed_app_reviews);
                            reviews_output_stream.write('\n');
                            reviews_output_stream.close();
                        });
                    }
                });
            });
        });
};


/*******MAIN************************************************* */

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var files = fs.readdirSync(directoryPath);
console.log(files.length + " app title files remaining to be scraped");
first_file = files.pop();

MongoClient.connect(url, {
    useNewUrlParser: true
}, function (err, db) {
    if (err) throw err;
    var dbo = db.db("app_data");

    getAppReviewsFromCSV(first_file, dbo);

    process.on("beforeExit", function () {
        console.log(files.length + " app title files remaining to be scraped");
        if (files.length < 1) {
            console.log("All files in this directory have been processed\n");
            console.log("Gracefully shutting down scraper process and database");
            db.close();
            return;
        } else {
            console.log("Next file...\n")
            file = files.pop();
            getAppReviewsFromCSV(file);
        }
    });
});