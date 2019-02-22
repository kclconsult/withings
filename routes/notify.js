var express = require('express');
var router = express.Router();
var models = require('../models');
const config = require('../lib/config');
const nokiaUtil = require('../lib/nokiaUtil');
const request = require('request');

function listNotificationURLs(body) {

		urls = [];

		list = JSON.parse(body).body.profiles;

		for ( url in list ) {

			urls.push(list[url].callbackurl);

		}

		return urls;

}

router.head('/', function(req, res, next) {

		res.sendStatus(200);

});

router.post('/', function(req, res, next) {

		models.notifications.create({

				data: JSON.stringify(req.query)

		});

		models.users.findOne({

		    where: {

		      nokiaID: req.body.userid

		    },

	  }).then(function(user) {

				params = {};
		    params[config.START["getmeas"]] = req.body.startdate;
		    params[config.END["getmeas"]] = req.body.enddate;
	  		nokiaUtil.getData(req, res, user, config.URLS["getmeas"], "getmeas", params, function(data) {

						console.log(data);

				});

	  });

		res.sendStatus(200);

});

router.get('/:id', function(req, res, next) {

		var id = req.params.id;

		models.users.findOne({

	      where: {

	        patientID: id

	      },

	  }).then(function(user) {

	  		req.session.oauth_request_token = user.token;
	  		req.session.oauth_request_token_secret = user.secret;
				req.session.oauth_refresh_token = user.refresh;
	  		req.session.save();

				params = {};
				params["action"] = "list";
				params["user_id"] = user.nokiaID;

				nokiaUtil.genURLFromRequestToken(req, res, config.SUBSCRIPTION_BASE, function(url) {

						request(url, function (error, response, body) {

								res.send(listNotificationURLs(body));

						});

				}, params);

	  });

});

router.get('/:id/revoke', function(req, res, next) {

		var id = req.params.id;

		models.users.findOne({

	      where: {

	        patientID: id

	      },

    }).then(function(user) {

    		req.session.oauth_request_token = user.token;
    		req.session.	oauth_request_token_secret = user.secret;

				params = {};
				params["action"] = "list";
				params["user_id"] = user.nokiaID;

				nokiaUtil.genURLFromRequestToken(config.SUBSCRIPTION_BASE, function(url) {

						request(url, function (error, response, body) {

								notificationURLs = listNotificationURLs(body);

								params["action"] = "revoke";

								for ( notificationURL in notificationURLs ) {

										params["callbackurl"] = require("querystring").escape(notificationURLs[notificationURL]);
										params["appli"] = 4;

										nokiaUtil.genURLFromRequestToken(config.SUBSCRIPTION_BASE, function(url) {

												request(url, function (error, response, body) {

														res.send(body);

												});

										}, params);

								}

						});

				}, params);

    });

});

module.exports = router;
