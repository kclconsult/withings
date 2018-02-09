var express = require('express');
var request = require('request');
var router = express.Router();
const config = require('../lib/config');
const Util = require('../lib/util');
const NokiaUtil = require('../lib/nokiaUtil');
var models = require('../models');

function getData(req, res, id, user, address, action, extra_params, jsonID) {
	
	if ( user ) {
		
		req.session.oauth_request_token = user.token;
		req.session.oauth_request_token_secret = user.secret;
		req.session.save();
		
		params = {};
		params["user_id"] = id;
		params["action"] = action;
		
		Object.assign(params, extra_params);
		
		NokiaUtil.genURLFromRequestToken(req, res, address, function(url) {
	
			request(url, function (error, response, body) {
				
				parsedBody = "";
				
				if ( body != undefined ) {
					
					// ~MDC A mess...
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
					
					parsedBody = JSON.parse(body)["body"][jsonID];
					
					for (element in parsedBody) {
						
						if ( !Util.validateDate(parsedBody[element]["date"].toString()) ) {
							
							var date = new Date(parseInt(parsedBody[element]["date"]) * 1000);
							
							var hours = date.getHours();
							
							var minutes = "0" + date.getMinutes();
							
							var seconds = "0" + date.getSeconds();
			
							var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
							
							parsedBody[element]["date"] = formattedTime + " " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
						
						}
		
					}
				
				}
				
				res.render('output', { content: JSON.stringify(parsedBody) } );
				
			});
			
		}, params);
	
	} else {
		
		res.render('output', { content: JSON.stringify("User not found.") } );
		
	}
	
}

function queryAction(req, res, action) {
	
	var id = req.params.id;

    models.users.findOne({

      where: {

        id: id

      },

    }).then(function(user) {
    		
    		params = {};
	    //params["meastype"] = 11
    		getData(req, res, id, user, config.URLS[action], action, params, config.TYPES[action]);
    	
    });
	
}

router.get('/:id/', function(req, res, next) {

    queryAction(req, res, "getmeas");
    
});

router.get('/:id/:action', function(req, res, next) {

    queryAction(req, res, req.params.action);
    
});

router.get('/:id/:action/:date', function(req, res, next) {

    var id = req.params.id;

    models.users.findOne({

      where: {

        id: id

      },

    }).then(function(user) {
    	
    	    params = {};
    	    params["date"] = req.params.date;
    		getData(req, res, id, user, config.URLS[req.params.action], req.params.action, params, config.TYPES[req.params.action]);
    	
    });
    
});

router.get('/:id/:action/:start/:end', function(req, res, next) {

    var id = req.params.id;

    models.users.findOne({

      where: {

        id: id

      },

    }).then(function(user) {
    	
    	    params = {};
    	    params[config.START[req.params.action]] = req.params.start;
    	    params[config.END[req.params.action]] = req.params.end;
    		getData(req, res, id, user, config.URLS[req.params.action], req.params.action, params, config.TYPES[req.params.action]);
    	
    });
    
});

module.exports = router;