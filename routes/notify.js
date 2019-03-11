const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');

const models = require('../models');

const nokiaUtil = require('../lib/nokiaUtil');

function listNotificationURLs(body) {

	urls = [];

	if ( body.length > 0 ) {

		list = JSON.parse(body).body.profiles;

		for ( url in list ) {

			urls.push(list[url].callbackurl);

		}

	}

	return urls;

}

router.head('/', function(req, res, next) {

	res.sendStatus(200);

});

router.post('/', function(req, res, next) {

	models.notifications.create({

		data: JSON.stringify(req.body)

	});

	models.users.findOne({

    where: {

      nokiaID: req.body.userid

    },

  }).then(function(user) {

		params = {};
    params[config.get('nokia_api_date.START')["getmeas"]] = req.body.startdate;
    params[config.get('nokia_api_date.END')["getmeas"]] = req.body.enddate;

		nokiaUtil.getData(req, res, user, config.get('nokia_api_date.URLS')["getmeas"], "getmeas", params, function(data) {

			if ( data.length > 0 ) {

				const parsedBody = JSON.parse(nokiaUtil.translateNokiaData(data))["body"];
				const allMeasures = parsedBody[config.get('nokia_api_date.TYPES')["getmeas"]][0];

				// If this is a BP reading.
				if ( parsedBody && allMeasures && allMeasures.measures[0].type.indexOf("Diastolic") >= 0 ) {

					request.post(config.get('sensor_to_fhir.URL') + "convert/bp", {

						json: {

							// TODO: Double check if dia and sys (and heart) ever come in different order from Nokia. Search for values instead?
							"subjectReference": user.patientID,
							"271650006": allMeasures.measures[0].value,
							"271649006": allMeasures.measures[1].value,
							"8867-4": allMeasures.measures[1].value

						}

					},
					function (error, response, body) {

						if (!error && response.statusCode == 200) {

							 console.log(response.body)

						} else {

							 console.log(error)

						}

					});

				}

			}

		});

  });

	res.sendStatus(200);

});

router.get('/:id', function(req, res, next) {

	var id = req.params.id;

	models.users.findOne({

    where: {

      patientID: id

    }

  }).then(function(user) {

		req.session.oauth_request_token = user.token;
		req.session.oauth_request_token_secret = user.secret;
		req.session.oauth_refresh_token = user.refresh;
		req.session.save();

		params = {};
		params["action"] = "list";
		params["user_id"] = user.nokiaID;

		nokiaUtil.genURLFromRequestToken(req, res, config.get('nokia_api.SUBSCRIPTION_BASE'), function(url) {

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

		nokiaUtil.genURLFromRequestToken(config.get('nokia_api.SUBSCRIPTION_BASE'), function(url) {

			request(url, function (error, response, body) {

				notificationURLs = listNotificationURLs(body);

				params["action"] = "revoke";

				for ( notificationURL in notificationURLs ) {

					params["callbackurl"] = require("querystring").escape(notificationURLs[notificationURL]);
					params["appli"] = 4;

					nokiaUtil.genURLFromRequestToken(config.get('nokia_api.SUBSCRIPTION_BASE'), function(url) {

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
