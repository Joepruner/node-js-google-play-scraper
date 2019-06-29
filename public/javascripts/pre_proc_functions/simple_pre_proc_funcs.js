var assert = require('assert');
var exports = module.exports = {};

exports.is_lt3_words = function (s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
    s = s.replace(/(\,|\'|\\|\/|\.)/gi, ""); //exclude other chars
    s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
    s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
    // console.log(s+'\n' + s.split(' ').filter(function(str){return str!="";}).length + '\n');
    if( s.split(' ').filter(function(str){return str!="";}).length < 3){
        return true; 
    }
    else{
        return false;
    }
}

exports.remove_non_ascii_chars = function (s){
    s = s.replace(/[^\x00-\x7F]/g, "");
    s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
    return s;
}