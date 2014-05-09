var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());



	app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users



// routes ==================================================
require('./app/routes')(app); // configure our routes

var port = Number(process.env.PORT || 5000);

// start app ===============================================
app.listen(port);										// startup our app at http://localhost:8080
console.log('Magic happens on port ' + port); 			// shoutout to the user