const gplay = require('google-play-scraper');

var getAppDetails = function getAppDetails(at) { // sample async action
    // console.log(at['title']);
        return new Promise(resolve => setTimeout(() => resolve(
            gplay.search({
                term: at,
                num: 1,
                fullDetail: true,
                throttle: 3
            })), 1000)).then(console.log).catch(function(){
                console.log("The app title " + at + " is not returning any results");
            });
};

console.log(getAppDetails("whatsapp"));