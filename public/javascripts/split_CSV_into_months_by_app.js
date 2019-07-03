const gplay = require('google-play-scraper');
// const gfs = require('graceful-fs');
const fs = require('graceful-fs');
const path = require('path');
// const input_path = path.join(__dirname, '..', '..', 'input_data', 'app_reviews', 'needs_date_sorting/');
const input_path = '/home/joseph/Desktop/all_google_play_data/unzipped_and_open/';
// const reviews_output_path = path.join(__dirname, '..', '..', 'output_data', 'date_sort_output/');
const reviews_output_path = '/home/joseph/Desktop/all_google_play_data/normalized_columns_and_month_sorted/';

const Json2csvParser = require('json2csv').Parser;
const csvtojsonV2 = require('csvtojson/v2');

//NOTE: I needed to change the /etc/systemd/system.conf -> NEWFILE -> 10240. Default is too low and throws err. 
//"Too many open files"

// filename=['amazon','facebook','google','google_map','google_play','messenger','outlook','snapchat','wechat','whatsapp']

const opts = {
    'header': false
};

var review_count = 0;
var file_count = 0;

var app_date_header_tracking = [];

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
                review_count++;
                // console.log(review);
                // return;
                try {
                    var date = JSON.stringify(review.date).split(" ");
                    // console.log(date);
                    var month = date[0];
                    var month = month.replace("\"", "");
                    var year = date[2];
                    var year = year.replace("\"", "");
                    // console.log(month+year)
                } catch (err) {
                    // console.log(err);
                }

                try {
                    var appTitleClean = review.appTitle.replace(/\W/g, '');
                } catch (err) {}

                var tag = appTitleClean + month + year;


                var reviews_output_stream = fs.createWriteStream(reviews_output_path + appTitleClean + "_reviews_" + month + "_" + year + '_.csv', {
                    encoding: 'utf8',
                    flags: 'a'
                });

                // console.log(review);

                //Normalizing columns, since reviewTitle and appGenre were added later. 
                if (review.hasOwnProperty('reviewTitle')) {
                    review.text = review.reviewTitle;
                    delete review.reviewTitle;
                }
                if (review.hasOwnProperty('appGenre')) {
                    delete review.appGenre;
                }
                if (review.hasOwnProperty('replyDate')) {
                    delete review.replyDate;
                    delete review.replyText;
                }
                try {
                    // fs.exists(reviews_output_path + review.appTitle + "_reviews_" + month + "_" + year + '_.csv', function (exists) {
                    if (!(app_date_header_tracking.includes(tag))) {
                        reviews_output_stream.write('"appTitle", "userName", "date", "score", "text"' + '\n');
                        app_date_header_tracking.push(appTitleClean + month + year);
                    }
                    var parsed_app_reviews = json2csvParserReviewsRest.parse(review);
                    reviews_output_stream.write(parsed_app_reviews + '\n');
                    reviews_output_stream.close();

                    // });
                } catch (err) {
                    console.error(err);
                }
            });

        });
};

// setInterval(function () {
//     console.log(file_count + ' files processed.');
//     console.log(review_count + ' reviews processed.\n');
// }, 1000 * 15)


// var num_files = files.length;

// files.forEach(file => {
//     if (path.extname(file) == '.csv') {
//         file_count++;
//         console.log(num_files + " app review files remaining to be scraped");
//         sortAppReviewsDateFromCSV(file);
//     }

//     num_files--;
// });
var files = fs.readdirSync(input_path);
console.log(files.length + " app title files remaining to be processed");

process.on("beforeExit", function () {

    if (files.length < 1) {
        console.log("All files in this directory have been processed\n");
        console.log("Gracefully shutting down scraper process and database");
        return;
    } else {
        file_count++;
        file = files.pop();
        try {
            sortAppReviewsDateFromCSV(file);
        } catch (err) {
            console.log(err);
        }
    }
});