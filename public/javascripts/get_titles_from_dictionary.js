const gplay = require('google-play-scraper');
const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, '..', '..', 'input_data', 'app_titles','by_dictionary/');
// const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson');
const reorder = require('csv-reorder');
const v8 = require('v8');

const sleep = require('sleep');


const dictionary = require('an-array-of-english-words');


fields = ['title'];
const json2csvParserAppTitles = new Json2csvParser({
    fields,
    quote: '',
});

var collections = [gplay.collection.TOP_FREE];
// , gplay.collection.TOP_PAID];
var rating_type = ['NEWEST', 'RATING', 'HELPFULNESS'];

var today = new Date();

var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();


// var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/' + date + '_app_details_TOP_FREE_';
// var external_apps_output_path = '/home/joepruner/Projects/GooglePlayScraper/output_data/worst_power_consumption_apps/' + date + '_all_details_worst_';
var all_titles_from_dictionary_output_path = '/home/joepruner/Projects/GooglePlayScraper/input_data/app_titles/by_dictionary/' + date + '_dictionary_app_titles_';


//search used for retrieving app titles by dictionary words
var SearchMaxApps = function SearchMaxApps(word) { // sample async action
    // console.log(at['title']);
    try {
        return new Promise(resolve => setTimeout(() => resolve(
            gplay.search({
                term: word,
                num: 120,
                // fullDetail: true,
                throttle: 3
            })), 5000));
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
            })), 5000));
    } catch (err) {
        console.log("Error inside getAppFullDetails" + err);
    }
};

//Search by all 275,000 dictionary words to get the most possible apps.
var getAppTitlesByDictionary = function getAppTitlesByDictionary() {

        for (var i = 0; i < dictionary.length; i=i+10000) {
        var word = dictionary[i];
        console.log(word);
        SearchMaxApps(word).then(function (appDictionaryTitles) {
            // console.log(word);

            //  + '\n' + appDictionaryTitles);
            appDictionaryTitles.forEach(function (app) {
                // console.log(app);
                getAppFullDetails(app.appId).then(function (fullDetails) {
                    if(fullDetails.reviews < 100000){
                        return;
                    }
                    var price_collection;
                    if (fullDetails.free == true) {
                        price_collection = 'FREE';
                    } else {
                        price_collection = 'PAID';
                    }
                    var all_titles_from_dictionary_output_stream = fs.createWriteStream(
                        all_titles_from_dictionary_output_path + fullDetails.genreId + '_' + price_collection + '_apps.csv', {
                            encoding: 'utf8',
                            flags: 'a'
                        });
                    //If csv file does not already exists, create it and write 'title' header.
                    if (fs.existsSync(all_titles_from_dictionary_output_path +
                            fullDetails.genreId + '_' + price_collection + '_apps.csv')) {} else {
                        all_titles_from_dictionary_output_stream.write('title');
                    }
                    var parsed_app_title = json2csvParserAppTitles.parse(app);
                    // console.log(parsed_app_title);
                    parsed_app_title = parsed_app_title.replace(/title/g, '');
                    parsed_app_title = parsed_app_title.replace(/,/g, "");
                    all_titles_from_dictionary_output_stream.write(parsed_app_title);

                });
            });
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
