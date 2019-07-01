const gplay = require('google-play-scraper');
// const gfs = require('graceful-fs');
const fs = require('fs');
const path = require('path');
const input_path = path.join(__dirname, '..', '..', 'input_data', 'app_reviews', 'needs_date_sorting/');
const reviews_output_path = path.join(__dirname, '..', '..', 'output_data', 'date_sort_output/');

const Json2csvParser = require('json2csv').Parser;
const csvtojsonV2 = require('csvtojson/v2');

// filename=['amazon','facebook','google','google_map','google_play','messenger','outlook','snapchat','wechat','whatsapp']

const opts = {
    'header': false
};

var fields = ['appTitle', 'userName', 'date', 'score', 'text', 'replyDate', 'replyText'];
const json2csvParserReviewsFirst = new Json2csvParser({
    fields
});
const json2csvParserReviewsRest = new Json2csvParser(opts);

var sortAppReviewsDateFromCSV = function getAppReviewsFromCSV(file) {
    console.log("Processing " + file);

    csvtojsonV2()
        .fromFile(input_path + file)
        .then((reviews) => {
            // console.log(reviews);
            reviews.forEach(review => {
                // console.log(review);
                // return;

                var date = JSON.stringify(review.date).split(" ");
                // console.log(date);
                var month = date[0];
                var month = month.replace("\"", "");
                var year = date[2];
                var year = year.replace("\"", "");
                // console.log(month+year)

                var reviews_output_stream = fs.createWriteStream(reviews_output_path + review.appTitle + "_reviews_" + month + "_" + year + '_.csv', {
                    encoding: 'utf8',
                    flags: 'a'
                });

                // console.log(review);

                if (review.hasOwnProperty('reviewTitle')) {
                    review.text = review.reviewTitle;
                    delete review.reviewTitle;
                }
                if (review.hasOwnProperty('appGenre')) {
                    delete review.appGenre;
                }
                // try {
                //     fs.exists(reviews_output_path + review.appTitle + "_reviews_" + month + "_" + year + '_.csv', function (exists) {
                //         if (!exists) {
                //             reviews_output_stream.write('"appTitle", "appGenre", "userName", "date", "score", "text", "replyDate", "replyText"' + '\n');
                //         } else {
                //             var parsed_app_reviews = json2csvParserReviewsRest.parse(review);
                //             reviews_output_stream.write(parsed_app_reviews + '\n');
                //         }
                //     });
                // } catch (err) {
                //     console.error(err);
                // }

                if (fs.existsSync(reviews_output_path + review.appTitle + "_reviews_" + month + "_" + year + '_.csv')) {

                } else {
                    var parsed_headers = json2csvParserReviewsFirst.parse();
                    reviews_output_stream.write(parsed_headers + '\n');
                    return;
                }
                var parsed_app_reviews = json2csvParserReviewsRest.parse(review);
                reviews_output_stream.write(parsed_app_reviews + '\n');
            });

        });
};

var files = fs.readdirSync(input_path);
var num_files = files.length;

files.forEach(file => {
    console.log(num_files + " app review files remaining to be scraped");
    sortAppReviewsDateFromCSV(file);
    num_files--;
});















// const gplay = require('google-play-scraper');
// const csvp = require('csv-parser');
// const csvw = require('csv-writer');
// const fs = require('fs');
// const path = require('path');
// const input_path = path.join(__dirname, '..', '..', 'input_data', 'app_reviews', 'needs_date_sorting/');
// const output_path = path.join(__dirname, '..', '..', 'output_data', 'date_sort_output/');

// // filename=['amazon','facebook','google','google_map','google_play','messenger','outlook','snapchat','wechat','whatsapp']


// var reviews_output_path = '/home/joseph/Projects/GooglePlayScraper/output_data/date_sort_output/';

// var sortAppReviewsDateFromCSV = function getAppReviewsFromCSV(file) {
//     console.log("Processing " + file);

//     fs.createReadStream(file)
//         .pipe(csvp())
//         .on('data', (row) => {

//         })
//         .on('end', () => {
//             console.log(file + ' successfully processed');
//         })

//     csvtojsonV2()
//         .fromFile(input_path + file)
//         .then((reviews) => {
//             // console.log(reviews);
//             reviews.forEach(review => {

//                 var date = JSON.stringify(review.date).split(" ");
//                 // console.log(date);
//                 var month = date[0];
//                 var month = month.replace("\"", "");
//                 var year = date[2];
//                 var year = year.replace("\"", "");
//                 // console.log(month+year)

//                 var reviews_output_stream = fs.createWriteStream(reviews_output_path + review.appTitle + "_reviews_" + month + "_" + year + '_.csv', {
//                     encoding: 'utf8',
//                     flags: 'a'
//                 });



//                 if (review.hasOwnProperty('reviewTitle')) {
//                     review.text = review.reviewTitle;
//                     delete review.reviewTitle;
//                 }

//                 // console.log(review);

//                 // if (fs.existsSync(reviews_output_path + review.appTitle + "_reviews_" + month + "_" + year + '_.csv')) {

//                 // } else {
//                 //     var parsed_headers = json2csvParserReviewsFirst.parse();
//                 //     reviews_output_stream.write(parsed_headers);
//                 //     reviews_output_stream.write('\n');
//                 // }


//                 var parsed_app_reviews = json2csvParserReviewsRest.parse(review);
//                 // console.log(parsed_app_reviews);
//                 reviews_output_stream.write(parsed_app_reviews);
//                 reviews_output_stream.write('\n');
//                 reviews_output_stream.close();

//             });
//         });
// };

// // var MongoClient = require('mongodb').MongoClient;
// // var url = "mongodb://localhost:27017/";

// var files = fs.readdirSync(input_path);
// var num_files = files.length;
// // console.log(num_files + " app review files remaining to be scraped");


// // sortAppReviewsDateFromCSV(first_file);

// // process.on("beforeExit", function () {
// files.forEach(file => {
//     console.log(num_files + " app review files remaining to be scraped");
//     sortAppReviewsDateFromCSV(file);
//     num_files--;
// });
// //     function () {
// //         console.log("All files in this directory have been processed\n");
// //         console.log("Gracefully shutting down CSV sorting process");
// //     })
// // // });
// // });