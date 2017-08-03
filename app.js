var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request')

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
