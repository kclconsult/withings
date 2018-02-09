const crypto = require('crypto');
const request = require('request');
const config = require('./config');
const NOKIA_CALLBACK = require("querystring").escape(config.CALLBACK_BASE + "/nokia/connect/callback");
const Util = require('./util');

class NokiaUtil {
	static genQueryString(input_params) {
		
		var params = Util.sortObject(input_params);
		
		var query_string = "";
		
		for ( var param in params ) {
			
			if ( param.indexOf("action") == -1 && param.indexOf("user_id") == -1 && param.indexOf("callbackurl") == -1 && param.indexOf("comment") == -1 && param.indexOf("appli") == -1 && param.indexOf("start") == -1 && param.indexOf("end") == -1 && param.indexOf("type") == -1 ) { 
			
				query_string += "oauth_" + param + "=" + params[param] + "&"; 
			
			} else {
				
				query_string += param + "=" + params[param] + "&";
			} 
		
		}
		
		return query_string.substring(0, query_string.length - 1);
		
	}
	static generateURL(base, key, secret, additional_params, callback) {
		
		crypto.randomBytes(16, function(err, buffer) {
			
			const nonce = buffer.toString('hex');
			const timestamp = (Math.floor(new Date() / 1000));
			
			var default_params = {};
			
			default_params["consumer_key"] = key;
			default_params["nonce"] = nonce;
			default_params["signature_method"] = "HMAC-SHA1";
			default_params["timestamp"] = timestamp;
			default_params["version"] = "1.0";
			
			var base_signature_string = "GET&" + require("querystring").escape(base) + "&" + require("querystring").escape(NokiaUtil.genQueryString(Object.assign(default_params, additional_params)));
			
			var hash = crypto.createHmac('sha1', secret).update(base_signature_string).digest('base64');
			
			var oauth_signature = encodeURIComponent(hash);
			
			default_params["signature"] = oauth_signature;
			
			var request_url = base + "?" + NokiaUtil.genQueryString(default_params);
			
			callback(request_url);
			
		});
		
	}
	static getRequestToken(req, res, callback) {
		
		if ( req.session.oauth_request_token == null && req.session.oauth_request_token_secret == null ) {
		
			var request_token_params = {};
			request_token_params["callback"] = NOKIA_CALLBACK;
			
			NokiaUtil.generateURL(config.NOKIA_REQUEST_TOKEN_BASE, config.NOKIA_CONSUMER_KEY, config.NOKIA_SECRET + "&", request_token_params, function(request_token_url) {
			
				request(request_token_url, function (error, response, body) {
				
					req.session.oauth_request_token =  Util.processKeyValue(body)["oauth_token"];
					req.session.oauth_request_token_secret = Util.processKeyValue(body)["oauth_token_secret"];
					req.session.save();
					
					callback(req.session.oauth_request_token, req.session.oauth_request_token_secret);
				
				});
			
			});
			
		} else {
			
			callback();
			
		}
		
	}
	static genURLFromRequestToken(req, res, base_url, callback, params = {}) {
		
		NokiaUtil.getRequestToken(req, res, function() {
			
			params["token"] = req.session.oauth_request_token;
			
			NokiaUtil.generateURL(base_url, config.NOKIA_CONSUMER_KEY, config.NOKIA_SECRET + "&" + req.session.oauth_request_token_secret, params, function(url) {
				
				callback(url);

			});
			
		});
		
	}
	static notificationSubscribe(req, res, params, callback) {
		
		NokiaUtil.genURLFromRequestToken(req, res, config.SUBSCRIPTION_BASE, function(url) {
			
			console.log(url);
			
			request(url, function (error, response, body) {
				
				console.log(body);
				
				callback();
				
			});
			
		}, params);
		
	}
}

module.exports = NokiaUtil;