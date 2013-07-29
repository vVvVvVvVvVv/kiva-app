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

app.use(express.bodyParser());
app.use(app.router);

var databaseManager = require('./databaseManager');

//routing
app.get('/', function(req, res) {
  res.sendfile('index.html');
});

app.get('/myapi', function(req, res) {
  databaseManager.queryLoans(function(rows) {
  	res.send(JSON.stringify(rows));
  });
});

app.post('/save/', function(req, res){
	var loans = req.body;
	console.log(loans);
	loans.forEach(function(loan){
		databaseManager.insertLoan(loan);
	});
});