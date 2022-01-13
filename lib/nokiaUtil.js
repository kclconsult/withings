const crypto = require('crypto');
const request = require('request');
const querystring = require("querystring");
const config = require('config');
const logger = require('../config/winston');

const util = require('./util');
const models = require('../models');

const NOKIA_CALLBACK = querystring.escape(config.get('nokia_api.CALLBACK_BASE') + "/nokia/connect/callback");

class NokiaUtil {
  
  static genQueryString(input_params) {
    
    var params = util.sortObject(input_params);
    var query_string = "";
    
    for ( var param in params ) {
      
      // ~MDC Messy...
      if ( param.indexOf("action") == -1 && param.indexOf("user_id") == -1 && param.indexOf("callbackurl") == -1 && param.indexOf("comment") == -1 && param.indexOf("appli") == -1 && param.indexOf("start") == -1 && param.indexOf("end") == -1 && param.indexOf("type") == -1 && param.indexOf("userid") == -1 && param.indexOf("date") == -1 ) {
        
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
      var d = new Date();
      //d.setHours(d.getHours() - 1)
      const timestamp = (Math.floor(d / 1000));
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
      
      NokiaUtil.generateURL(config.get('nokia_api.NOKIA_REQUEST_TOKEN_BASE'), config.get('nokia_api_auth.NOKIA_CONSUMER_KEY'), config.get('nokia_api_auth.NOKIA_SECRET') + "&", request_token_params, function(request_token_url) {
        
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
    
    if ( config.get('nokia_api.OAUTH_VERSION') == 2 ) {
      
      var body = {
        "grant_type": "refresh_token",
        "client_id": config.get('nokia_api_auth.NOKIA_CLIENT_ID'),
        "client_secret": config.get('nokia_api_auth.NOKIA_CONSUMER_SECRET'),
        "refresh_token": req.session.oauth_refresh_token
      };
      
      var bodyData = querystring.stringify(body);
      
      // ~MDC Reconsider refreshing token on every request.
      util.postRequest(config.get('nokia_api.NOKIA_ACCESS_TOKEN_BASE_OAUTH2'), bodyData, function(error, response, body) {
        
        body = JSON.parse(body);
        
        if ( body.access_token && body.refresh_token ) {
          
          // ~MDC Ugly. Remove all of this.
          req.session.oauth_request_token = body.access_token;
          req.session.oauth_refresh_token = body.refresh_token;
          req.session.save();
          
          models.users.update({
            
            token: body.access_token,
            secret: "",
            refresh: body.refresh_token
            
          },
          {
            
            where: {
              
              nokiaID: body.userid
              
            }
            
          }).then(function() {
            
            var url = base_url + "?access_token=" + req.session.oauth_request_token + "&" + NokiaUtil.genQueryString(params);
            callback(url);
            
          });
          
        } else {
          
          logger.error("Failed to refresh token.");
          callback(null);
          
        }
        
      });
      
    } else {
      
      NokiaUtil.getRequestToken(req, res, function() {
        
        params["token"] = req.session.oauth_request_token;
        
        NokiaUtil.generateURL(base_url, config.get('nokia_api_auth.NOKIA_CONSUMER_KEY'), config.get('nokia_api_auth.NOKIA_SECRET') + "&" + req.session.oauth_request_token_secret, params, function(url) {
          
          callback(url);
          
        });
        
      });
      
    }
    
  }
  
  static notificationSubscribe(req, res, params, callback) {
    
    NokiaUtil.genURLFromRequestToken(req, res, config.get('nokia_api.SUBSCRIPTION_BASE'), function(url) {
      
      request(url, function (error, response, body) {
        
        if (!error && ( response && response.statusCode == 200 ) ) {
          
          logger.debug("Created new notification for user.");
          callback(200);
          
        } else {
          
          logger.error("Could not setup new notification for user: " + error + " " + ( response && response.body && typeof response.body === 'object' ? JSON.stringify(response.body) : "" ) + " " + ( response && response.statusCode ? response.statusCode : "" ));
          callback(400);
          
        }
        
      });
      
    }, params);
    
  }
  
  static getData(req, res, user, address, action, extra_params, callback) {
    
    if ( user ) {
      
      req.session.oauth_request_token = user.token;
      req.session.oauth_refresh_token = user.refresh;
      req.session.oauth_request_token_secret = user.secret;
      req.session.save();
      
      params = {};
      
      if (config.get('nokia_api.OAUTH_VERSION') == 2) {
        
        params["userid"] = user.nokiaID;
        
      } else {
        
        params["user_id"] = user.nokiaID;
        
      }
      
      params["action"] = action;
      
      Object.assign(params, extra_params);
      
      NokiaUtil.genURLFromRequestToken(req, res, address, function(url) {
        
        request(url, function (error, response, body) {
          
          var parsedBodyWrapper;
          
          // ~MDC Body contains string object which itself contains a body... Shrug.
          if ( body && ( parsedBodyWrapper = util.JSONParseWrapper(body) ) && parsedBodyWrapper.hasOwnProperty('status') && ( parsedBodyWrapper.status == 0 ) && parsedBodyWrapper.body && ( body = parsedBodyWrapper.body )  ) {
            
            callback(body);
            
          } else {
            
            logger.error("Failed to parse patient data from API: " + error + " " + ( ( parsedBodyWrapper && typeof parsedBodyWrapper === "object" ) ? JSON.stringify(parsedBodyWrapper) : "No body, or cannot be parsed." ) + " " + ( ( parsedBodyWrapper && parsedBodyWrapper.status == 0 ) ? parsedBodyWrapper.status : "Wrong status, cannot be parsed or no body." ) + " " + ( ( body && typeof body === "object" ) ? JSON.stringify(body) : "No nested body, cannot be parsed or no body." ) + " " + ( ( response && response.statusCode ) ? response.statusCode : "Cannot get response status." ) );
            callback(null);
            
          }
          
        });
        
      }, params);
      
    } else {
      
      logger.error("User not specified.");
      callback(null);
      
    }
    
  }
  
  static translateNokiaData(body) {
    
    var data = body;
    // ~MDC Temporarily convert any object input to a string to change data. Messy...
    if ( typeof body === "object" ) data = JSON.stringify(body);
    
    data = data.replace(/"type":4/g, '"type": "Height (meters)"');
    data = data.replace(/"type":9/g, '"type": "Diastolic Blood Pressure (mmHg)"');
    data = data.replace(/"type":10/g, '"type": "Systolic Blood Pressure (mmHg)"');
    data = data.replace(/"type":11/g, '"type": "Heart Pulse (bpm)"');
    data = data.replace(/"type":1/g, '"type": "Weight (kg)"');
    
    data = data.replace(/"category":1/g, '"category": "Real measurement"');
    data = data.replace(/"category":2/g, '"category": "User objective"');
    
    data = data.replace(/"attrib":0/g, '"category": "The measuregroup has been captured by a device and is known to belong to this user \(and is not ambiguous\)"');
    data = data.replace(/"attrib":1/g, '"category": "The measuregroup has been captured by a device but may belong to other users as well as this one (it is ambiguous)"');
    data = data.replace(/"attrib":2/g, '"category": "The measuregroup has been entered manually for this particular user"');
    data = data.replace(/"attrib":4/g, '"category": "The measuregroup has been entered manually during user creation (and may not be accurate)"');
    data = data.replace(/"attrib":5/g, '"category": "Measure auto, it\'s only for the Blood Pressure Monitor. This device can make many measures and computed the best value"');
    data = data.replace(/"attrib":7/g, '"category": "Measure confirmed. You can get this value if the user confirmed a detected activity"');
    
    data = data.replace(/"unit"/g, '"Power of ten multiplier (unit)"');
    
    var reparsedBody;
    if ( typeof body === "object" && ( reparsedBody = util.JSONParseWrapper(data) ) ) {
      
      return reparsedBody;
      
    } else {
      
      return data;
      
    }
    
  }
  
}

module.exports = NokiaUtil;
