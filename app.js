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

//

const nokia_request_token_base = "https://developer.health.nokia.com/account/request_token";
const nokia_callback = require("querystring").escape("http://localhost:3000/connect/nokia/callback");
const nokia_consumer_key = "";
const nokia_secret = "";

const nokia_user_base = "https://developer.health.nokia.com/account/authorize";

const nokia_token_base = "https://developer.health.nokia.com/account/access_token";

function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

function genQueryString(input_params) {
	
	var params = sortObject(input_params);
	
	console.log(params);
	
	var query_string = "";
	
	for ( var param in params ) {
		
		query_string += "oauth_" + param + "=" + params[param] + "&";
		
	}
	
	return query_string.substring(0, query_string.length - 1);
	
}

function generateURL(base, key, secret, additional_params, callback) {
	
	crypto.randomBytes(16, function(err, buffer) {
		
		const timestamp = (Math.floor(new Date() / 1000));
		const nonce = buffer.toString('hex');
		
		var default_params = [];
		
		default_params["consumer_key"] = key;
		default_params["nonce"] = nonce;
		default_params["signature_method"] = "HMAC-SHA1";
		default_params["timestamp"] = timestamp;
		default_params["version"] = "1.0";
		
		var base_signature_string = "GET&" + require("querystring").escape(base) + "&" + require("querystring").escape(genQueryString(
		Object.assign(default_params, additional_params)));
		
		console.log(base_signature_string);
		
		var hash = crypto.createHmac('sha1', secret + "&").update(base_signature_string).digest('base64');
		
		var oauth_signature = encodeURIComponent(hash);
		
		default_params["signature"] = oauth_signature;
		
		var request_url = base + "?" + genQueryString(default_params);
		
		callback(request_url);
		
	});
	
}

function processKeyValue(input) {
	
	key_value = [];
	
	for ( var entry in input.split("&") ) {
		
		key_value[input.split("&")[entry].split("=")[0]] = input.split("&")[entry].split("=")[1]
		
	}
	
	return key_value;
	
}

app.get('/nokia', function (req, res) {
	
	var token_params = [];
	token_params["callback"] = nokia_callback;
	generateURL(nokia_request_token_base, nokia_consumer_key, nokia_secret, token_params, function(url) {
		
		console.log(url);
		
		request(url, function (error, response, body) {
			
			console.log(body);
			
			var user_params = [];
			user_params["token"] = processKeyValue(body)["oauth_token"];
			
			generateURL(nokia_user_base, nokia_consumer_key, nokia_secret + "&" + processKeyValue(body)["oauth_token_secret"], user_params, function(user_auth_url) {
				
				console.log(user_auth_url)
		
			});
			
		});
		
	})
	
	res.end();
	
});

app.get('/connect/nokia/callback', function (req, res) {
	
	console.log(req.query.userid);
	
	generateURL(nokia_request_token_base, nokia_consumer_key, nokia_secret, "oauth_callback=" + nokia_callback, function(url) {
		
		request(url, function (error, response, body) {
			
			generateURL(nokia_token_base, nokia_consumer_key, nokia_secret + "&" + processKeyValue(body)["oauth_token_secret"], "oauth_token=" + processKeyValue(body)["oauth_token"], function(token_url) {
				
				console.log(token_url);
				
				/*request(token_url, function (error, response, body) {
					
					console.log(body)
					
				});*/
		
			});
			
		});
		
	})
	
	res.end();
	
});

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
