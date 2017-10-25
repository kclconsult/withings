var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require('crypto');
var models  = require('./models');

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
const nokia_callback = require("querystring").escape("http://martinchapman.ddns.net/nokia/connect/callback");
const nokia_consumer_key = "";
const nokia_secret = "";

const nokia_request_token_base = "https://developer.health.nokia.com/account/request_token";

const nokia_authorisation_base = "https://developer.health.nokia.com/account/authorize";

const nokia_access_token_base = "https://developer.health.nokia.com/account/access_token";

const nokia_user_data = "http://api.health.nokia.com/measure";
const subscription_base = "https://api.health.nokia.com/notify";

function sortObject(o) {
	
    var sorted = {}, key, a = [];

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
	
	var query_string = "";
	
	for ( var param in params ) {
		
		if ( param.indexOf("action") == -1 && param.indexOf("user_id") == -1 && param.indexOf("callbackurl") == -1 && param.indexOf("comment") == -1 && param.indexOf("appli") == -1 ) { 
		
			query_string += "oauth_" + param + "=" + params[param] + "&"; 
		
		} else {
			
			query_string += param + "=" + params[param] + "&";
		} 
	
	}
	
	return query_string.substring(0, query_string.length - 1);
	
}

function generateURL(base, key, secret, additional_params, callback) {
	
	crypto.randomBytes(16, function(err, buffer) {
		
		const nonce = buffer.toString('hex');
		const timestamp = (Math.floor(new Date() / 1000));
		
		var default_params = [];
		
		default_params["consumer_key"] = key;
		default_params["nonce"] = nonce;
		default_params["signature_method"] = "HMAC-SHA1";
		default_params["timestamp"] = timestamp;
		default_params["version"] = "1.0";
		
		var base_signature_string = "GET&" + require("querystring").escape(base) + "&" + require("querystring").escape(genQueryString(
		Object.assign(default_params, additional_params)));
		
		var hash = crypto.createHmac('sha1', secret).update(base_signature_string).digest('base64');
		
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

var oauth_request_token;
var oauth_request_token_secret;

function genURLFromRequestToken(base_url, callback, params = []) {
	
	getRequestToken(function() {
		
		params["token"] = oauth_request_token;
		
		generateURL(base_url, nokia_consumer_key, nokia_secret + "&" + oauth_request_token_secret, params, function(url) {
			
			callback(url);

		});
		
	});
	
}

function getRequestToken(callback) {
	
	if ( oauth_request_token == null && oauth_request_token_secret == null ) {
	
		var request_token_params = [];
		request_token_params["callback"] = nokia_callback;
		generateURL(nokia_request_token_base, nokia_consumer_key, nokia_secret + "&", request_token_params, function(request_token_url) {
		
			request(request_token_url, function (error, response, body) {
			
				oauth_request_token =  processKeyValue(body)["oauth_token"];
			
				oauth_request_token_secret = processKeyValue(body)["oauth_token_secret"]
				
				callback(oauth_request_token, oauth_request_token_secret);
			
			});
		
		})
		
	} else {
		
		callback();
		
	}
	
}

app.get('/register', function (req, res) {
	
	genURLFromRequestToken(nokia_authorisation_base, function(url) {
		console.log(url);
	});
	
	res.end();
	
});

app.get('/connect/callback', function (req, res) {
	 
	genURLFromRequestToken(nokia_access_token_base, function(url) {
		
		// Request access token using generated URL.
		request(url, function (error, response, body) {
		
			// Is overwritten with updated access token for final call (~MDC there's a neater way to do this).
			oauth_request_token = processKeyValue(body)['oauth_token'];
			oauth_request_token_secret = processKeyValue(body)['oauth_token_secret'];
			
			models.users.findOrCreate({
				
				where: {
				
					id: req.query.userid
				
				},
				defaults: {
				
					id: req.query.userid,
				    token: oauth_request_token,
					secret: oauth_request_token_secret
				
				}
				
			}).error(function(err) {
				
				console.log(err);
				
			}).then(function() {
				
				params = [];
				params["action"] = "subscribe";
				params["user_id"] = req.query.userid;
				params["callbackurl"] = require("querystring").escape("http://www.martinchapman.co.uk/nokia.php");
				params["comment"] = "comment";
				params["appli"] = 4;
				
				genURLFromRequestToken(subscription_base, function(url) {
					
					console.log(url);
					
					request(url, function (error, response, body) {
						
						console.log(body);
						
					});
					
				}, params);
			});
			
		});
		
	});
	
	res.end();
	
});

app.get('/notify/:id', function(req, res, next) {
	
	var id = req.params.id;
	
	models.users.findOne({

      where: {

        id: id

      },

    }).then(function(user) {
    	
    	oauth_request_token = user.token;
    	oauth_request_token_secret = user.secret;
    	
		params = [];
		params["action"] = "list";
		params["user_id"] = req.params.id;
		
		genURLFromRequestToken(subscription_base, function(url) {
			
			console.log(url);
			
			request(url, function (error, response, body) {
				
				console.log(body);
				
			});
			
		}, params);
	
    });
	
});

app.get('/notify', function(req, res, next) {
	
	models.notifications.create({
		
		data: JSON.stringify(req.query)
	
	});
	
	/*models.measures.create({
		
		value: "a",
		type: "b",
		multiplier: "c",
		
		groups: {
			
			grpid: "e",
			category: "f",
			date: "g"
			
		}
		
	}, {
		
		include: [{
			
			association: models.measures.associate
		
		}]
		
	});*/
	
	console.log(req.query);
	
	res.end();
	
});

app.get('/dashboard/:id', function(req, res, next) {

    var id = req.params.id;

    models.users.findOne({

      where: {

        id: id

      },

    }).then(function(user) {
    	
    	oauth_request_token = user.token;
    	oauth_request_token_secret = user.secret;
    	
    	params = [];
    	params["user_id"] = id;
		params["action"] = "getmeas";
		
    	genURLFromRequestToken(nokia_user_data, function(url) {

			request(url, function (error, response, body) {
				
				body = body.replace(/"type":4/g, '"type": "Height (meters)"');
				body = body.replace(/"type":9/g, '"type": "Diastolic Blood Pressure (mmHg)"');
				body = body.replace(/"type":10/g, '"type": "Systolic Blood Pressure (mmHg)"');
				body = body.replace(/"type":11/g, '"type": "Heart Pulse (bpm)"');
				body = body.replace(/"type":1/g, '"type": "Weight (kg)"');
				
				body = body.replace(/"category":1/g, '"category": "Real measurement"');
				body = body.replace(/"category":2/g, '"category": "User objective"');
				
				body = body.replace(/"attrib":0/g, '"category": "The measuregroup has been captured by a device and is known to belong to this user \(and is not ambiguous\)"');
				body = body.replace(/"attrib":1/g, '"category": "The measuregroup has been captured by a device but may belong to other users as well as this one (it is ambiguous)"');
				body = body.replace(/"attrib":2/g, '"category": "The measuregroup has been entered manually for this particular user"');
				body = body.replace(/"attrib":4/g, '"category": "The measuregroup has been entered manually during user creation (and may not be accurate)"');
				body = body.replace(/"attrib":5/g, '"category": "Measure auto, it\'s only for the Blood Pressure Monitor. This device can make many measures and computed the best value"');
				body = body.replace(/"attrib":7/g, '"category": "Measure confirmed. You can get this value if the user confirmed a detected activity"');
				
				body = body.replace(/"unit"/g, '"Power of ten multiplier (unit)"');
				
				parsedBody = JSON.parse(body)["body"]["measuregrps"];
				
				for (element in parsedBody) {
					
					var date = new Date(parseInt(parsedBody[element]["date"])*1000);
					
					var hours = date.getHours();
					
					var minutes = "0" + date.getMinutes();
					
					var seconds = "0" + date.getSeconds();

					var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
					
					parsedBody[element]["date"] = formattedTime + " " + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();

				}
				
				res.render('output', { content: JSON.stringify(parsedBody) } );
				
			});
			
		}, params);
    	
    });
    
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
