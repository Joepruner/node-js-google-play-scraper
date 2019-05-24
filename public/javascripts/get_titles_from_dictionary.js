const gplay = require('google-play-scraper');
const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, '..', '..', 'output_data', 'all_app_titles/');
// const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson');
const reorder = require('csv-reorder');
const v8 = require('v8');

const sleep = require('sleep');


const dictionary = require('an-array-of-english-words');

// words.forEach(function(word){
//     console.log(word);
// });

const opts = {
    'header': false
};

var fields = ['appTitle', 'userName', 'date', 'score', 'text'];
const json2csvParserReviewsFirst = new Json2csvParser({
    fields
});

fields = ['title'];
const json2csvParserAppTitles = new Json2csvParser({
    fields,
    quote: '',
});
const json2csvParserApps = new Json2csvParser();
const json2csvParserReviewsRest = new Json2csvParser(opts);



var all_app_categories = [gplay.category.APPLICATION
    // , gplay.category.ANDROID_WEAR, gplay.category.ART_AND_DESIGN,

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
// var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/worst_power_consumption_apps/' + date + '_all_details_worst_';
var all_titles_from_dictionary_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/all_app_titles/' + date + '_all_app_titles_';

// var external_reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/' + date + '_newest_reveiws_TOP_FREE_';
var external_reviews_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/worst_power_consumption_apps/' + date + '_newest_reveiws_worst_';




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
                throttle: 3
            })), 60000));
    } catch (err) {
        console.log("Error inside getAppDetails" + err);
    }
};

//search used for retrieving app titles by dictionary words
var SearchMaxApps = function SearchMaxApps(word) { // sample async action
    // console.log(at['title']);
    try {
        return new Promise(resolve => setTimeout(() => resolve(
            gplay.search({
                term: word,
                num: 100,
                // fullDetail: true,
                throttle: 2
            })), 60000));
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

//Search by all 275,000 dictionary words to get the most possible apps.
var getAppTitlesByDictionary = function getAppTitlesByDictionary() {

        for (var i = 0; i < dictionary.length; i=i+100) {
        var word = dictionary[i];
        console.log(word);
        SearchMaxApps(word).then(function (appDictionaryTitles) {
            // console.log(word);

            //  + '\n' + appDictionaryTitles);
            appDictionaryTitles.forEach(function (app) {
                // console.log(app);
                getAppFullDetails(app.appId).then(function (fullDetails) {
                    var collection;
                    if (fullDetails.free == true) {
                        collection = 'FREE';
                    } else {
                        collection = 'PAID';
                    }
                    var all_titles_from_dictionary_output_stream = fs.createWriteStream(
                        all_titles_from_dictionary_output_path + fullDetails.genreId + '_' + collection + '_apps.csv', {
                            encoding: 'utf8',
                            flags: 'a'
                        });
                    //If csv file does not already exists, create it and write 'title' header.
                    if (fs.existsSync(all_titles_from_dictionary_output_path +
                            fullDetails.genreId + '_' + collection + '_apps.csv')) {} else {
                        all_titles_from_dictionary_output_stream.write('title');
                    }
                    var parsed_app_title = json2csvParserAppTitles.parse(app);
                    // console.log(parsed_app_title);
                    parsed_app_title = parsed_app_title.replace(/title/g, '');
                    parsed_app_title = parsed_app_title.replace(/,/g, "");
                    all_titles_from_dictionary_output_stream.write(parsed_app_title);

                });
            });
            // console.log(appCategoryTitles);
            // var parsed_app_dictionary_titles = json2csvParserAppTitles.parse(app_dictionary_titles);

            // parsed_app_titles = parsed_app_titles.replace(/title,/g, "title");
            // all_titles_from_dictionary_output_stream.write(parsed_app_titles);
            // all_titles_from_dictionary_output_stream.write('\n');
        });
    }

};

function clean_app_titles() {
    console.log("In clean function");
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            console.log(file);
            // file = file.replace(/,/g, "");
            reorder({
                input: directoryPath + file,
                output: directoryPath + 'clean_' + file,
                sort: 'title',
                type: 'string',
                remove: true
            });
            // console.log(file);
            // console.log(typeof file);
        });
    });

}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


getAppTitlesByDictionary();
// clean_app_titles();

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