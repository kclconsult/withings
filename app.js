var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var models = require('./models');

const Util = require('./lib/util');
const NokiaUtil = require('./lib/nokiaUtil');

var register = require('./routes/register');
var connect = require('./routes/connect');
var dashboard = require('./routes/dashboard');
var notify = require('./routes/notify');

var app = express();

var session = require('express-session');
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "secret"
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

///////////////////////////

app.use('/register', register)
app.use('/connect', connect)
app.use('/dashboard', dashboard)
app.use('/notify', notify)
	
///////////////////////////

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
