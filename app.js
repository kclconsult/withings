// Imports
const express = require('express');
const session = require('express-session')
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request');
const auth = require('basic-auth');

// Environment variables
require('dotenv').config()

// Config
const config = require('config');

// Models
const models = require('./models');

// Express app
const app = express();
const router = express.Router();

// Session
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "secret"
}));

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Default use
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

///////////////////////////

// Routes
const register = require('./routes/register');
const connect = require('./routes/connect');
const dashboard = require('./routes/dashboard');
const notify = require('./routes/notify');
const simulate = require('./routes/simulate');

// Route setup involving async
function init() {

  if ( config.get('message_queue.ACTIVE') == true ) {

    var amqp = require('amqplib');
    var QueueMessage = require('./lib/messages/queueMessage');

    // Return AMQP connect Promise from init.
    return amqp.connect('amqp://' + config.get('message_queue.HOST')).then(function(connection) {

      router.use('/simulate', simulate(new QueueMessage(connection, config.get('message_queue.NAME'))));

    }).catch(console.warn);

    // TODO: .finally(function() { conn.close(); });

  } else {

    var HTTPMessage = require('./lib/messages/httpMessage');
    router.use('/simulate', simulate(new HTTPMessage()));
    return Promise.resolve();

  }

}

// Non-async route setup
router.use('/connect', connect)
router.use('/notify', notify)

router.use('/', function(req, res, next) {

  var credentials = auth(req)

  if ( !credentials || credentials.name !== config.get('credentials.USERNAME') || credentials.pass !== config.get('credentials.PASSWORD') ) {

    res.status(401);
    res.header('WWW-Authenticate', 'Basic realm="forbidden"');
    res.send('Access denied');

  } else {

    next();

  }

});

router.use('/register', register)
router.use('/dashboard', dashboard)
app.use('/nokia', router)

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

// Start app once async init done.
init().then(() => app.listen(process.env.PORT || '3000')).catch(err => console.error(err));

module.exports = app;
