var express         = require("express");
var app             = express();
var bodyParser      = require("body-parser");
var mongoose       = require("mongoose");
var methodOverride  = require("method-override");

var db = require("./config/db");

var port = process.env.PORT || 8080;

mongoose.connect(db.url);

app.use(bodyParser.json());
app.use(bodyParser.json({type: "application/vnd.api+json"}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));

// *** May not need since I won't be serving my app from here. ***
// app.use(express.static(__dirname + "/public"));

var router = express.Router();

require('./app/routes/routes')(router);

app.use('/api', router);

app.listen(port);

console.log("Magic happens on port " + port);

exports = module.exports = app;