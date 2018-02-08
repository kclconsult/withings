var express = require('express');
var router = express.Router();
var request = require('request');
var models = require('../models');
const config = require('../lib/config');
const Util = require('../lib/util');
const NokiaUtil = require('../lib/nokiaUtil');

router.get('/callback', function (req, res) {
	 
	NokiaUtil.genURLFromRequestToken(req, res, config.NOKIA_ACCESS_TOKEN_BASE, function(url) {
		
		// Request access token using generated URL.
		request(url, function (error, response, body) {
		
			// Is overwritten with updated access token for final call (~MDC there's a neater way to do this).
			req.session.oauth_request_token = Util.processKeyValue(body)['oauth_token'];
			req.session.oauth_request_token_secret = Util.processKeyValue(body)['oauth_token_secret'];
			req.session.save();
			
			models.users.findOrCreate({
				
				where: {
				
					id: req.query.userid
				
				},
				defaults: {
				
					id: req.query.userid,
				    token: req.session.oauth_request_token,
					secret: req.session.oauth_request_token_secret
				
				}
				
			}).error(function(err) {
				
				console.log(err);
				
			}).then(function() {
				
				params = {};
				params["action"] = "subscribe";
				params["user_id"] = req.query.userid;
				params["callbackurl"] = require("querystring").escape(config.CALLBACK_BASE + "/nokia.php");
				params["comment"] = "comment";
				params["appli"] = 4;
				
				NokiaUtil.notificationSubscribe(req, res, params, function() {
					
					params["appli"] = 1;
					
					NokiaUtil.notificationSubscribe(req, res, params, function() {
						
						params["appli"] = 16;
						
						NokiaUtil.notificationSubscribe(req, res, params, function() {});
						
					})
				})
				
			});
			
		});
		
	});
	
	res.end();
	
});

module.exports = router;