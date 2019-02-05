const gplay = require('google-play-scraper');
const fs = require('fs');
const csv = require('csv-parser');
const Json2csvParser = require('json2csv').Parser;
const Json2csvTransform = require('json2csv').Transform;
// var app_titles = {};
// const fields = ['title'];

const fields = ['title', 'appId','score'];
const opts = { fields };
const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };

const json2csvParser = new Json2csvParser({opts});
const json2csv = new Json2csvTransform(opts, transformOpts);

var app_titles = [];
var apps = {};
var input_path = '../../input_data/worst_app_titles.csv';
var input_stream = fs.createReadStream(input_path,{ encoding: 'utf8' });
var output_path = '../../output_data/detailed_worst_apps.csv';
var output_stream = fs.createWriteStream(output_path,{ encoding: 'utf8' });



input_stream
    .pipe(csv())
    .on('data', (row) => {
        app_titles.push(row);
    }).on('end', function () {

        var count = 1;
        app_titles.forEach(title => {
            // console.log(title['title']);
            try {
                gplay.search({
                    term: title['title'],
                    num: 2,
                    fullDetail: false,
                    throttle: 10
                }).then(function (result) {
                    apps = json2csvParser.parse(result);
                        // console.log(apps);


                    // });
                }).then(function(){
                    output_stream.write(apps);
                    // console.log(apps);
                });
            }
            catch (error) {
                console.log(error);



            }
            // console.log(csv);
            // console.log(count);
        });
    }).on('end', function(){
        console.log('Done');
    });
// console.log(apps);




        // csv_output = json2csvParser.parse(apps);
        // apps.forEach(info =>{
        //     console.log(info);
        // });
        // console.log(apps);
        // csv_output = json2csvParser.parse(apps);
        // console.log(apps);

// console.log(app_titles);




