var assert = require('assert');
var exports = module.exports = {};

exports.is_lt3_words = function (s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
    s = s.replace(/(\,|\'|\\|\/|\.)/gi, ""); //exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
    s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
    // console.log(s+'\n' + s.split(' ').filter(function(str){return str!="";}).length + '\n');
    if( s.split(' ').filter(function(str){return str!="";}).length < 4){
        return true; 
    }
    else{
        return false;
    }
    //return s.split(' ').filter(String).length; - this can also be used
    
}

// assert.equal(is_lt3_words('Hello World!'), 2);
// assert.equal(is_lt3_words('How much, is . that doggy /     in the window?'), 8);
// assert.equal(is_lt3_words('This app is pure    garbage!'), 5);
// assert.equal(is_lt3_words('%$#^ this app. I\'m done.'), 5);