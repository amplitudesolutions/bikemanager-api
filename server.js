var express         = require("express");
var app             = express();
var bodyParser      = require("body-parser");
var mongoose       = require("mongoose");
var methodOverride  = require("method-override");

var db = require("./config/db");

var port = process.env.PORT || 443;

mongoose.connect(db, function(err, res) {
	if (err)
		console.log(err);
});

app.use(bodyParser.json());
app.use(bodyParser.json({type: "application/vnd.api+json"}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", process.env.ALLOWEDSITES);
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
	res.header("Access-Control-Allow-Methods", "'GET, POST, DELETE, OPTIONS, PUT, PATCH'");
  
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
	} else {
		next();
	}
});

// *** May not need since I won't be serving my app from here. ***
// app.use(express.static(__dirname + "/public"));

var router = express.Router();

require('./app/routes/routes')(router);

router.get('/', function(req, res) {
	// processTemplate("Hello [employee.firstname] [employee.lastname], welcome to Amplitude Solutions.", "employee", "0798db21-f8ba-439e-ba85-b3a982c8ea1d").then(function(result) {
	// 	res.json(result);	
	// });

	res.status(200).send("API Started...");
});


app.use('/api', router);

app.listen(port);

console.log("Environment: "  + app.settings.env + " Magic happens on port " + port);

exports = module.exports = app;