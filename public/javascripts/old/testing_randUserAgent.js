var http = require('http')
  , useragent = require('express-useragent');

var srv = http.createServer(function (req, res) {
  var source = req.headers['user-agent'],
  ua = useragent.parse(source);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(JSON.stringify(ua));
  console.log("UA is : " + ua);
});

srv.listen(443);