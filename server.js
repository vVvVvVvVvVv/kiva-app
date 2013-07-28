//set up the web framework
var express = require("express");
var app = express();

//add logging
app.use(express.logger());
var port = 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});

//server static files from main folder for simplicity
app.use(express.static(__dirname + '/'));

//routing
app.get('/', function(req, res) {
  res.sendfile('index.html');
});