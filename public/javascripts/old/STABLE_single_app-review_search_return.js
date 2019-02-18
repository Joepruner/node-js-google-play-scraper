const gplay = require('google-play-scraper');
const fs = require('fs');
const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const csvtojson = require('csvtojson')

const fields = ['url', 'text', 'userName', 'date', 'score', 'scoreText'];

const json2csvParserTitles = new Json2csvParser();
const json2csvParserApps = new Json2csvParser();
const json2csvParserReviews = new Json2csvParser({ fields });


var app_titles = [];
var apps = {};
var app_Ids = [];
// var title;



// var titles_input_path = '../../input_data/SHORT_TEST_worst_app_titles.csv';
var titles_input_path = '../../input_data/worst_app_titles.csv';
var apps_output_path = '../../output_data/detailed_worst_apps.csv';
var reviews_output_path = '../../output_data/reviews_worst_apps.csv';

var titles_input_stream = fs.createReadStream(titles_input_path, { encoding: 'utf8' });
var apps_output_stream = fs.createWriteStream(apps_output_path, { encoding: 'utf8' });
var reviews_output_stream = fs.createWriteStream(reviews_output_path, { encoding: 'utf8' });
// , flags: 'a'


// titles_input_stream
//     .pipe(csv())
//     .on('data', (row) => {
//         // console.log(row);
//         app_titles.push(row);
//     }).on('end', () => {
//         console.log('Finished');
//         titles_input_stream.destroy();
//     });
// return row;
// row.age = 'forever';
// console.log(row);
// app_titles.forEach(title => {
// console.log(row);

csvtojson()
    .fromFile(titles_input_path)
    .then((titles) => {
        // console.log(titles);

        // console.log(app_titles);

        for (var t in titles) {
            app_titles.push(titles[t]);
        }
        return app_titles;
    }).then((result) => {
        // var t = titles[t];
        // console.log(result[0]);
        var i = 0;
        // for (i = 0; i < 2;) {
            // console.log(result[i]['title']);
            // i = i-1;
            // console.log(i);
            // var iter = i;
            // console.log('first loop= ' + i);
            gplay.search({
                term: result[i]['title'],
                num: 1,
                fullDetail: false,
                throttle: 10
            }).then((apps) => {
                // i = i-1;
                // console.log('second loop= ' + i);

                for (var id in apps) {
                    app_Ids.push(apps[0]['appId']);
                }
                // console.log(apps[0]['appId']);
                // console.log(apps);
                // apps = json2csvParserApps.parse(apps[0]);
                // apps_output_stream.write(apps);

                return apps;
            }).then((result) => {
                // console.log(result[0]['appId']);
                // console.log('third loop= ' + i);
                gplay.reviews({
                    appId: result[0]['appId'],
                    page: 0,
                    sort: gplay.sort.NEWEST
                }).then((reviews) => {
                    // console.log('fourth loop= ' + i);
                    console.log(reviews);
                    // csv_reviews = json2csvParserReviews.parse(reviews);
                    // reviews_output_stream.write(csv_reviews);

                });

            });
        // }
    });
