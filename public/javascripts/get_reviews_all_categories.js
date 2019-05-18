const gplay = require('google-play-scraper');
const fs = require('fs');
// const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson');
const sleep = require('sleep');




const opts = {
    'header': false
};

var fields = ['appTitle', 'userName', 'date', 'score', 'text'];
const json2csvParserReviewsFirst = new Json2csvParser({
    fields
});

fields = ['title'];
const json2csvParserCategoryTitles = new Json2csvParser({
    fields,
    quote:'',
});
const json2csvParserApps = new Json2csvParser();
const json2csvParserReviewsRest = new Json2csvParser(opts);



var all_app_categories = [gplay.category.APPLICATION, gplay.category.ANDROID_WEAR, gplay.category.ART_AND_DESIGN

    // gplay.category.AUTO_AND_VEHICLES, gplay.category.BEAUTY, gplay.category.BOOKS_AND_REFERENCE, gplay.category.BUSINESS,
    // gplay.category.COMICS, gplay.category.COMMUNICATION, gplay.category.DATING, gplay.category.EDUCATION, gplay.category.ENTERTAINMENT,
    // gplay.category.EVENTS, gplay.category.FINANCE, gplay.category.FOOD_AND_DRINK, gplay.category.HEALTH_AND_FITNESS,
    // gplay.category.HOUSE_AND_HOME, gplay.category.LIBRARIES_AND_DEMO, gplay.category.LIFESTYLE, gplay.category.MAPS_AND_NAVIGATION,
    // gplay.category.MEDICAL, gplay.category.MUSIC_AND_AUDIO, gplay.category.NEWS_AND_MAGAZINES,
    // gplay.category.PARENTING, gplay.category.PERSONALIZATION, gplay.category.PHOTOGRAPHY, gplay.category.PRODUCTIVITY,
    // gplay.category.SHOPPING, gplay.category.SOCIAL, gplay.category.SPORTS, gplay.category.TOOLS,
    // gplay.category.TRAVEL_AND_LOCAL, gplay.category.VIDEO_PLAYERS, gplay.category.WEATHER, gplay.category.GAME_ACTION, gplay.category.GAME_ADVENTURE, gplay.category.GAME_ARCADE, gplay.category.GAME_BOARD,
    // gplay.category.GAME_CARD, gplay.category.GAME_CASINO, gplay.category.GAME_CASUAL, gplay.category.GAME_EDUCATIONAL,
    // gplay.category.GAME_MUSIC, gplay.category.GAME_PUZZLE, gplay.category.GAME_RACING, gplay.category.GAME_ROLE_PLAYING, gplay.category.GAME_SIMULATION,
    // gplay.category.GAME_SPORTS, gplay.category.GAME_STRATEGY, gplay.category.GAME_TRIVIA, gplay.category.GAME_WORD,
    // gplay.category.FAMILY_ACTION, gplay.category.FAMILY_BRAINGAMES, gplay.category.FAMILY_CREATE, gplay.category.FAMILY_EDUCATION, gplay.category.FAMILY_MUSICVIDEO, gplay.category.FAMILY_PRETEND
];

// var all_app_categories = ['APPLICATION', 'ANDROID_WEAR', 'ART_AND_DESIGN', 'AUTO_AND_VEHICLES', 'BEAUTY', 'BOOKS_AND_REFERENCE', 'BUSINESS',
//     'COMICS', 'COMMUNICATION', 'DATING', 'EDUCATION', 'ENTERTAINMENT', 'EVENTS', 'FINANCE', 'FOOD_AND_DRINK', 'HEALTH_AND_FITNESS',
//     'HOUSE_AND_HOME', 'LIBRARIES_AND_DEMO', 'LIFESTYLE', 'MAPS_AND_NAVIGATION', 'MEDICAL', 'MUSIC_AND_AUDIO', 'NEWS_AND_MAGAZINES',
//     'PARENTING', 'PERSONALIZATION', 'PHOTOGRAPHY', 'PRODUCTIVITY', 'SHOPPING', 'SOCIAL', 'SPORTS', 'TOOLS', 'TRAVEL_AND_LOCAL', 'VIDEO_PLAYERS',
//     'WEATHER', 'GAME_ACTION', 'GAME_ADVENTURE', 'GAME_ARCADE', 'GAME_BOARD', 'GAME_CARD', 'GAME_CASINO', 'GAME_CASUAL', 'GAME_EDUCATIONAL',
//     'GAME_MUSIC', 'GAME_PUZZLE', 'GAME_RACING', 'GAME_ROLE_PLAYING', 'GAME_SIMULATION', 'GAME_SPORTS', 'GAME_STRATEGY', 'GAME_TRIVIA', 'GAME_WORD',
//     'FAMILY_ACTION', 'FAMILY_BRAINGAMES', 'FAMILY_CREATE', 'FAMILY_EDUCATION', 'FAMILY_MUSICVIDEO', 'FAMILY_PRETEND'
// ];
var collections = [gplay.collection.TOP_FREE];
// , gplay.collection.TOP_PAID];
var rating_type = ['NEWEST', 'RATING', 'HELPFULNESS'];

var today = new Date();

var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();


// var titles_input_path = '/home/joepruner/Projects/GooglePlayScraper/input_data/categories(8)_all_titles_NO_SEP.csv';
var titles_input_path = '/home/joepruner/Projects/GooglePlayScraper/input_data/worst_mod_app_titles.csv';

// var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/' + date + '_app_details_TOP_FREE_';
var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/worst_power_consumption_apps/' + date + '_all_details_worst_';
var all_titles_all_categories_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/all_app_titles/' + date + '_all_app_titles_';

// var external_reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/' + date + '_newest_reveiws_TOP_FREE_';
var external_reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/worst_power_consumption_apps/' + date + '_newest_reveiws_worst_';


//Write titles to CSV to read back in.
var getAppTitlesByCategory = function getAppTitlesByCategory() {
    collections.forEach(function (col) {
        // var collection = col;
        all_app_categories.forEach(function (cat) {
            // var category = cat;
            var all_titles_all_categories_output_stream = fs.createWriteStream(all_titles_all_categories_path + '_' + col + '_' + cat + '_apps.csv', {
                encoding: 'utf8',
                // flags: 'a'
            });

            return new Promise(resolve => setTimeout(() => resolve(
                gplay.list({
                    category: cat,
                    collection: col,
                    num: 120
                }).then(function (appCategoryTitles) {
                    console.log(appCategoryTitles);
                    var parsed_app_category_titles = json2csvParserCategoryTitles.parse(appCategoryTitles);
                    // console.log(parsed_app_category_titles)
                    all_titles_all_categories_output_stream.write(parsed_app_category_titles);
                    all_titles_all_categories_output_stream.write('\n');
                })), 60000));
        });
    });
};




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
            })), 60000));
    } catch (err) {
        console.log("Error inside getAppDetails" + err);
    }
};

var getAppFullDetails = function getAppFullDetails(aid) {
    try {
        return new Promise(resolve => setTimeout(() => resolve(
            gplay.app({
                appId: aid
            })), 60000));
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

function get_app_reviews() {

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
}

getAppTitlesByCategory();


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