var gplay = require('google-play-scraper');

function get_all() {
    gplay.categories().then(function(categories){
        gplay.list({
            category: categories[1],
            collection: gplay.collection.TOP_FREE,
            num: 5
        }).then(function(apps){
            gplay.reviews({
                appId: apps[2]['appId'],
                page: 0,
                sort: gplay.sort.RATING
              }).then(console.log);
        });
        console.log(categories[1]);
    });
}

get_all();
