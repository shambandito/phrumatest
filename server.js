var express = require("express");
var logfmt = require("logfmt");
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var app = express();


var secret = 'this is the secret secret secret 12356';

app.use(logfmt.requestLogger());

app.use('/api', expressJwt({secret: secret}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users


app.post('/authenticate', function (req, res) {
  //TODO validate req.body.username and req.body.password
  //if is invalid, return 401
  if (!(req.body.username == 'philip' && req.body.password == 'cookie')) {
    console.log("bin drin?????");
    res.send(401, 'Wrong user or password');
    return;
  }

  var profile = {
    username: 'Philip',
    id: 123
  };

  var token = jwt.sign(profile, secret, { expiresInMinutes: 60*5 });

  res.json({ token: token });
});

app.get('/api/restricted', function (req, res) {
  console.log('user ' + req.user.email + ' is calling /api/restricted');
  res.json({  name: 'Philip'});
});

app.get('*', function(req, res, next) {
  res.sendfile('./public/views/index.html'); // load our public/views/index.html file
});


// routes ==================================================
//require('./app/routes')(app); // configure our routes

var port = Number(process.env.PORT || 5000);

// start app ===============================================
app.listen(port);										// startup our app at http://localhost:8080
console.log('Magic happens on port ' + port); 			// shoutout to the user

