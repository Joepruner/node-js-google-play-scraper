var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/app_data";



MongoClient.connect(url, {
    useNewUrlParser: true
}, function (err, db) {
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("app_data");

    var app_reviews = dbo.collection('app_reviews');

    var duplicates = [];
    app_reviews.aggregate([{
            $group: {
                _id: {
                    hash: "$hash"
                },
                dups: {
                    "$addToSet": "$_id"
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $match: {
                count: {
                    $gt: 1
                }
            }
        },
    ], {
        allowDiskUse: true
    }, function (err, data) {
        // console.log("inside function\n")
        if (err) {
            throw err;
        } else {
            data.forEach(function (doc) {
                console.log(doc);
                doc.dups.shift(); // First element skipped for deleting
                doc.dups.forEach(function (dupId) {
                    duplicates.push(dupId);
                    // if (duplicates.length <0){
                    //     console.log("There are no duplicate reviews")
                    // }
                    // Getting all duplicate ids
                    //console.log("pushing id ", dupId);
                    app_reviews.deleteOne({
                        _id: dupId
                    }, function (err, obj) {
                        if (err) throw err;
                        console.log(obj.result.n + " document(s) deleted");
                        dbo.close();
                    });
                    
                })
                // duplicates.forEach(function (id) {
                // console.log(id + '\n');

                // })

            })
        }
    });

});










// mongoose.connect("mongodb://127.0.0.1:27017/app_data", {
//     useNewUrlParser: true
// });

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//     console.log("Connected to MongoDB!");
//     var app_reviews = new mongoose.Schema({

//     })

//     var duplicates = [];
//     app_reviews.aggregate([{
//                 $group: {
//                     _id: {
//                         hash: "$hash"
//                     },
//                     dups: {
//                         "$addToSet": "$_id"
//                     },
//                     count: {
//                         $sum: 1
//                     }
//                 }
//             },
//             {
//                 $match: {
//                     count: {
//                         $gt: 1
//                     }
//                 }
//             }
//         ])
//         .allowDiskUse(true)
//         .exec(function (err, data) {
//             if (err) {
//                 throw err;
//             } else {
//                 data.forEach(function (doc) {
//                     doc.dups.shift(); // First element skipped for deleting
//                     doc.dups.forEach(function (dupId) {
//                         duplicates.push(dupId); // Getting all duplicate ids
//                         //console.log("pushing id ", dupId);
//                     })
//                 })
//             }
//         });

//     // // Remove all duplicates in one go    
//     // db.app_reviews.remove({
//     //     _id: {
//     //         $in: duplicates
//     //     }
//     // })

// });