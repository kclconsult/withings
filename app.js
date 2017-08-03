var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require('crypto');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//////////Grant //////////

var Grant = require('grant-express');
var grant = new Grant(require('./config.json'));

// REQUIRED:
app.use(session({secret:'very secret', resave: true, saveUninitialized: true}))
// mount grant
app.use(grant)

// http://localhost:3000/connect/ihealth/callback

app.get('/handle_nokia_callback', function (req, res) {
	
	console.log(req);
	console.log(res);
	
	res.end(JSON.stringify(req.query, null, 2))
	  
});

const nokia_base = "https://developer.health.nokia.com/account/request_token";
const nokia_callback = require("querystring").escape("http://localhost:3000/connect/nokia/callback");
const nokia_consumer_key = "";
const nokia_secret = "";
var nokia_nonce = "";

console.log(require("querystring").escape(require("querystring").escape("/")));

crypto.randomBytes(16, function(err, buffer) {

	nokia_nonce = buffer.toString('hex');
	
	var base_string = "oauth_callback=" + nokia_callback + "&oauth_consumer_key=" + nokia_consumer_key + "&oauth_nonce=" + nokia_nonce + "&oauth_signature_method=HMAC-SHA1&oauth_timestamp=" + (Math.floor(new Date() / 1000)) + "&oauth_version=1.0";
	
	var base_signature_string = "GET&" + require("querystring").escape(nokia_base) + "&" + require("querystring").escape(base_string);
	
	console.log(base_signature_string);
	
	var hash = crypto.createHmac('sha1', nokia_secret + "&").update(base_signature_string).digest('base64');
	
	var oauth_signature = encodeURIComponent(new Buffer(hash).toString('base64'));
	
	//console.log(oauth_signature);
	
	request(base_string + "&oauth_signature=" + oauth_signature, function (error, response, body) {
	
		//console.log('error:', error); 
	    //console.log('statusCode:', response && response.statusCode); 
	    console.log('body:', body); 
	
	});
	
});

//app.get('/bloop', function(req, res) {
	
	
	
	//res.end();

//});

app.get('/handle_ihealth_callback', function (req, res) {

  var urlA = 'user/' + req.query.raw.UserID;
  var urlB = 'application'
  var reqURL = 'http://sandboxapi.ihealthlabs.com/openapiv2/' + urlB;
  
  var sc = '0fc5bf91bf374fb796f0dc666a0d6420';
  var sv = '1126e827d9b94845ac14f9435cdf13f1';
  var start_time = '1342007016';
  var end_time = '1498867200';
  
  var fullURL = reqURL + '/bp.json/?client_id=' + grant.config.ihealth.key + '&client_secret=' + grant.config.ihealth.secret + '&redirect_uri=' + 'http://localhost:3000/bp_data' + '&access_token=' + req.query.raw.AccessToken + '&start_time=' + start_time + '&end_time=' + end_time + '&page_index=1&sc=' + sc + '&sv=' + sv;
  
  console.log(fullURL)
  
  request(fullURL, function (error, response, body) {
    console.log('error:', error); 
    console.log('statusCode:', response && response.statusCode); 
    console.log('body:', body); 
  });
  
  res.end(JSON.stringify(req.query, null, 2))
  
})

app.get('/bp_data', function (req, res) {
	
  console.log(req);
  console.log(res);
	
})

///////////////////////////

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
