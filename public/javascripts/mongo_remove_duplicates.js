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
                    app_reviews.deleteOne({
                        _id: dupId
                    }, function (err, obj) {
                        if (err) throw err;
                        console.log(obj.result.n + " document(s) deleted");
                        dbo.close();
                    });
                })
            })
        }
    });

});