const gplay = require('google-play-scraper');
const fs = require('fs');
const path = require('path');
// const directoryPath = path.join(__dirname, '..', '..', 'input_data', 'all_app_titles', 'by_category', 'test/');
const directoryPath = path.join(__dirname, '..', '..', 'input_data', 'app_titles', 'by_dictionary/');
console.log(directoryPath);
// const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojsonV2 = require('csvtojson/v2');
const reorder = require('csv-reorder');
const v8 = require('v8');

const sleep = require('sleep');


const opts = {
    'header': false
};

var fields = ['appTitle', 'userName', 'date', 'score', 'text'];
const json2csvParserReviewsFirst = new Json2csvParser({
    fields
});
const json2csvParserReviewsRest = new Json2csvParser(opts);

// fields = ['title'];
// const json2csvParserAppTitles = new Json2csvParser({
//     fields,
//     quote: '',
// });

var fields = ['title', 'installs', 'minInstalls', 'scoreText', 'ratings', 'reviews', 'price', 'free',
    'currency', 'priceText', 'offersIAP', 'size', 'androidVersion', 'androidVersionText', 'developer', 'genreId',
    'familyGenreId', 'adSupported', 'released', 'updated', 'version', 'recentChanges', 'appId'
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


// var titles_input_path = '/home/joepruner/Projects/GooglePlayScraper/input_data/categories(8)_all_titles_NO_SEP.csv';
// var titles_input_path = '/home/joepruner/Projects/GooglePlayScraper/all_app_titles/by_category/';

var app_details_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/test_output/' + date + '_app_details_';
// var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/worst_power_consumption_apps/' + date + '_all_details_worst_';
// var all_titles_from_dictionary_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/all_app_titles/' + date + '_all_app_titles_';

// var external_reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/' + date + '_newest_reveiws_TOP_FREE_';
var reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/test_output/' + date + '_reviews_';




/**
 * Returns JSON array of basic app details from the first (or more) search result(s),
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
                // fullDetail: true,
                throttle: 10
            })), 2000));
    } catch (err) {
        console.log("Error inside getAppDetails" + err);
    }
};

/**
 *Retrieves the fully detailed app information.
 * @param {*} aid - The app id to search with.
 */
var getAppFullDetails = function getAppFullDetails(aid) {
    try {
        return new Promise(resolve => setTimeout(() => resolve(
            gplay.app({
                appId: aid,
                throttle: 10
            })), 2000));
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
            }, appTitle)), 2000));
    } catch (err) {
        console.log("Error inside getAppReviews" + err);
    }
};



// function clean_app_titles() {
//     console.log("In clean function");
//     fs.readdir(directoryPath, function (err, files) {
//         if (err) {
//             return console.log('Unable to scan directory: ' + err);
//         }
//         files.forEach(function (file) {
//             console.log(file);
//             // file = file.replace(/,/g, "");
//             reorder({
//                 input: directoryPath + file,
//                 output: directoryPath + 'clean_' + file,
//                 sort: 'title',
//                 type: 'string',
//                 remove: true
//             });
//             // console.log(file);
//             // console.log(typeof file);
//         });
//     });

// }



function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var getAppReviewsFromCSV = function getAppReviewsFromCSV() {
    // console.log('test');
    var files = fs.readdirSync(directoryPath);

        files.forEach(function (file) {
            // console.log('test');

            try {
                csvtojsonV2()
                    .fromFile(directoryPath + file)
                    .then((titles) => {
                        console.log(titles);

                        try {
                            var pending_getAppDetails_promise = titles.map(getAppDetails);

                            var resolved_getAppDetails_promise = Promise.all(pending_getAppDetails_promise);
                            // sleep.sleep(2);
                            return resolved_getAppDetails_promise;
                        } catch (err) {
                            console.log("Error in getAppDetails: " + err);
                        }
                    }).then(function (appDetails) {
                        // console.log(appDetails);
                        // var num_titles = Object.keys(appDetails).length;
                        appDetails.forEach(app => {
                            // sleep.sleep(15);
                            try {
                                getAppFullDetails(app[0].appId).then(function (fullDetails) {
                                    if (fullDetails.reviews < 100000) {
                                        return;
                                    }
                                    var price_collection;
                                    if (fullDetails.free == true) {
                                        price_collection = 'FREE';
                                    } else {
                                        price_collection = 'PAID';
                                    }
                                    var app_genre;
                                    if (JSON.stringify(fullDetails.genreId).includes('GAME') == true) {
                                        app_genre = 'ALL_GAMES';
                                    } else {
                                        app_genre = fullDetails.genreId;
                                    }

                                    var apps_output_stream = fs.createWriteStream(app_details_output_path + app_genre + '_' + price_collection + '_apps.csv', {
                                        encoding: 'utf8',
                                        flags: 'a'
                                    });
                                    if (fs.existsSync(app_details_output_path + app_genre + '_' + price_collection + '_apps.csv')) {

                                    } else {
                                        var parsed_detail_headers = json2csvParserAppFullDetailsFirst.parse();
                                        apps_output_stream.write(parsed_detail_headers);
                                        apps_output_stream.write('\n');
                                    }
                                    var parsed_app_details = json2csvParserAppFullDetailsRest.parse(fullDetails);
                                    apps_output_stream.write(parsed_app_details);
                                    apps_output_stream.write('\n');
                                    apps_output_stream.close();
                                    return fullDetails;

                                }).then((fullDetails) => {
                                    console.log(fullDetails.reviews);
                                    var price_collection;
                                    if (fullDetails.free == true) {
                                        price_collection = 'FREE';
                                    } else {
                                        price_collection = 'PAID';
                                    }
                                    // console.log(fullDetails);
                                    for (var i = 0; i < 4; i++) {
                                        // if (i % 27 == 0) {
                                        //     var rand = getRndInteger(1, 8);
                                        //     console.log(i);
                                        //     console.log("Sleeping for " + rand + " seconds.");
                                        //     sleep.sleep(rand);
                                        // }
                                        // console.log(app[0] + '\n');
                                        // sort_type.forEach(function (type) {
                                        // console.log(app[0].appId +'\n'+app[0].title);
                                        try {
                                            getAppReviews(app[0].appId, i, app[0].title).then(function (review) {
                                                // console.log(app[0].appId +'\n'+app[0].titile);
                                                if (review.length < 1 || review == undefined) {
                                                    return false;
                                                }

                                                var app_genre;
                                                if (JSON.stringify(fullDetails.genreId).includes('GAME') == true) {
                                                    app_genre = 'ALL_GAMES';
                                                } else {
                                                    app_genre = fullDetails.genreId;
                                                }

                                                var reviews_output_stream = fs.createWriteStream(reviews_output_path + 'NEWEST_' + app_genre + '_' + price_collection + '_apps.csv', {
                                                    encoding: 'utf8',
                                                    flags: 'a'
                                                });

                                                // try {
                                                if (fs.existsSync(reviews_output_path + 'NEWEST_' + app_genre + '_' + price_collection + '_apps.csv')) {

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
                                        // });
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
        });

};

getAppReviewsFromCSV();


// node --max-old-space-size=12288 get_reviews_from_title_csv.js

// console.log(v8.getHeapStatistics().total_available_size /1024/1024);



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