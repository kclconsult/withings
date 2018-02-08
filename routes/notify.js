var express = require('express');
var router = express.Router();
var models = require('../models');
const config = require('../lib/config');
const NokiaUtil = require('../lib/nokiaUtil');

function listNotificationURLs(body) {
	
	urls = [];
	
	list = JSON.parse(body).body.profiles;
	
	for ( url in list ) {
		
		urls.push(list[url].callbackurl);
		
	}
	
	return urls;
	
}

router.get('/:id', function(req, res, next) {
	
	var id = req.params.id;
	
	models.users.findOne({

      where: {

        id: id

      },

    }).then(function(user) {
    	
    		req.session.oauth_request_token = user.token;
    		req.session.oauth_request_token_secret = user.secret;
    		req.session.save();
    		
		params = {};
		params["action"] = "list";
		params["user_id"] = req.params.id;
		
		NokiaUtil.genURLFromRequestToken(req, res, config.SUBSCRIPTION_BASE, function(url) {
			
			request(url, function (error, response, body) {
				
				console.log(listNotificationURLs(body));
				
			});
			
		}, params);
	
    });
	
	res.end();
	
});

router.get('/:id/revoke', function(req, res, next) {
	
	var id = req.params.id;
	
	models.users.findOne({

      where: {

        id: id

      },

    }).then(function(user) {
    	
    		req.session.oauth_request_token = user.token;
    		req.session.	oauth_request_token_secret = user.secret;
    	
		params = {};
		params["action"] = "list";
		params["user_id"] = req.params.id;
		
		NokiaUtils.genURLFromRequestToken(config.SUBSCRIPTION_BASE, function(url) {
			
			request(url, function (error, response, body) {
				
				notificationURLs = NokiaUtils.listNotificationURLs(body);
				
				params["action"] = "revoke";
				
				for ( notificationURL in notificationURLs ) {
					
					params["callbackurl"] = require("querystring").escape(notificationURLs[notificationURL]);
					params["appli"] = 4;
					
					console.log(url);
					
					NokiaUtils.genURLFromRequestToken(config.SUBSCRIPTION_BASE, function(url) {
						
						request(url, function (error, response, body) {
							
							console.log(body);
							
						});
						
					}, params);
					
				}
				
			});
			
		}, params);
	
    });
	
	res.end();
	
});

router.get('/temp', function(req, res, next) {
	
	models.measures.create({
		
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
			
			include: models.measures
		
		}]
		
	});
	
	console.log(req.query);
	
	res.end();
	
});

router.get('/', function(req, res, next) {
	
	models.notifications.create({
		
		data: JSON.stringify(req.query)
	
	});
	
	console.log(req.query);
	
	res.end();
	
});


module.exports = router;
