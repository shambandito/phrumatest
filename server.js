var express = require("express");
var logfmt = require("logfmt");
var cors = require('cors');
var app = express();

app.use(logfmt.requestLogger());

var login= {'username' : 'ruben', 'password' : '1234'};


app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users


app.get('/api/login', function(req, res, next) {
  res.json(login);
});



app.get('*', function(req, res, next) {
  res.type('html');
  res.sendfile('./public/views/index.html'); // load our public/views/index.html file
});


// routes ==================================================
//require('./app/routes')(app); // configure our routes

var port = Number(process.env.PORT || 5000);

// start app ===============================================
app.listen(port);										// startup our app at http://localhost:8080
console.log('Magic happens on port ' + port); 			// shoutout to the user