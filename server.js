var express = require("express");
var logfmt = require("logfmt");
var mongoose = require("mongoose");
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var app = express();


var secret = 'this is the secret secret secret 12356';
mongoose.connect('mongodb://phrumadb:cookie5910@ds039058.mongolab.com:39058/login');
var Schema = mongoose.Schema;

app.use(logfmt.requestLogger());

app.use('/api', expressJwt({secret: secret}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users

var user = mongoose.model('User', new Schema({ 
  username: String,
  email : String,
  password : String
}),'users');

app.post('/newuser',function(req,res){

  user.find({username : req.body.username},function(err,data){
    console.log(data[0]);
    if(data[0] != null){
      console.log("ich geh hier rein");
      res.send(401,'User already exists');
    return;
    }
    else{
      user.find({email : req.body.email},function(err,data){
        if(data[0] != null){
          res.send(401,'email already exists');
        return;
        }
        else{
          user.create({
            username: req.body.username,
            email : req.body.email,
            password : req.body.password
          }, function(err, data) {
            if (err)
            res.send(err);
            res.json(data);
          });
        }
      });
    }
  });
});

  

app.post('/authenticate', function (req, res) {

  var username = req.body.username;
  var email = false;

  //Ist Username email oder username 
  for (var i = 0; i < username.length; i++) {
    if (username[i] == "@") {
      email = true;
      break;
    }
  }

  //Wenn keine email email == false und stringvergleich mit data[0].username
  if(email == false){
    user.find({username : username},function(err, data) {
      if (!(username == data[0].username && req.body.password == data[0].password)) {
      res.send(401, 'Wrong user or password');
      return;
    }

    var profile = {
      username: username,
      email : data[0].email,
      id: 123
    };

  var token = jwt.sign(profile, secret, { expiresInMinutes: 60*5 });

  res.json({ token: token });
  });
  } else{
    user.find({email : username},function(err, data) {
      if (!(username == data[0].email && req.body.password == data[0].password)) {
        res.send(401, 'Wrong user or password');
        return;
      }

  var profile = {
    username: data[0].username,
    email : username,
    id: 123
  };

  var token = jwt.sign(profile, secret, { expiresInMinutes: 60*5 });

  res.json({ token: token });
  })
  }
    

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

