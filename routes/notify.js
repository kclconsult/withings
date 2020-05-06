const express = require('express');
const router = express.Router();
const request = require('request');
const uuid = require('uuid');
const { v1: uuidv1 } = require('uuid');
const config = require('config');
const logger = require('../config/winston');

const models = require('../models');

const util = require('../lib/util');
const nokiaUtil = require('../lib/nokiaUtil');

module.exports = function(messageObject) {

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

		logger.info("Received notification.");

		models.notifications.create({

			data: JSON.stringify(req.body)

		});

		if ( userid = util.validPath(req, ["body", "userid"]) ) {

			models.users.findOne({

		    where: {

		      nokiaID: userid

		    },

		  }).then(function(user) {

				if ( user ) {

					if ( ( startdate = util.validPath(req, ["body", "startdate"]) ) && ( enddate = util.validPath(req, ["body", "enddate"]) ) ) {

						params = {};
				    params[config.get('nokia_api_data.START')["getmeas"]] = startdate;
				    params[config.get('nokia_api_data.END')["getmeas"]] = enddate;

						nokiaUtil.getData(req, res, user, config.get('nokia_api_data.URLS')["getmeas"], "getmeas", params, function(body) {

							if ( body ) {

								logger.info("Got data related to notification.");

								if ( translatedNokiaData = nokiaUtil.translateNokiaData(body) ) {

									if ( ( allMeasuresOuter = translatedNokiaData[config.get('nokia_api_data.TYPES')["getmeas"]] ) && allMeasuresOuter[0] && ( allMeasures = allMeasuresOuter[0] ) ) {

										// If this is a BP reading.
										if ( translatedNokiaData && allMeasures && ( bpReading = util.validPath(allMeasures, ["measures", "0", "type"]) ) && bpReading.indexOf("Diastolic") >= 0 ) {

											if ( ( c271650006 = util.validPath(allMeasures, ["measures", "0", "value"]) ) && ( c271649006 = util.validPath(allMeasures, ["measures", "1", "value"]) ) && ( c8867h4 = util.validPath(allMeasures, ["measures", "2", "value"]) ) ) {

												var jsonRow = {

													// TODO: Double check if dia and sys (and heart) ever come in different order from Nokia. Search for values instead?
													"reading": "BP",
													"id": uuidv1(), // TODO: Something from Nokia to prevent repeat readings?
													"subjectReference": user.patientID,
													"practitionerReference": "da6da8b0-56e5-11e9-8d7b-95e10210fac3", // TODO: Determine which practitioner to reference.
													"c271650006": c271650006,
													"c271649006": c271649006,
													"c8867h4": c8867h4

												};

												messageObject.send(config.get('sensor_to_fhir.URL') + "/create/bp", jsonRow).then(function() {

													logger.info("Sent BP reading to sensor-fhir-mapper.");

												});

											} else {

												if (!c271650006) util.noParse("data for 271650006", ["measures", "0", "value"], allMeasures);
												if (!c271649006) util.noParse("data for 271649006", ["measures", "1", "value"], allMeasures);
												if (!c8867h4) util.noParse("data for 8867-4", ["measures", "2", "value"], allMeasures);

											}

										} else {

											logger.error("Could not determine the type of reading received.");

										}

									} else {

										logger.error("Failed to get measures from the data received on this measure: ");
										if (!allMeasuresOuter) logger.error(config.get('nokia_api_data.TYPES')["getmeas"] + " not in " + translatedNokiaData);
										if (allMeasuresOuter && !allMeasuresOuter[0]) logger.error("Could not find 0th index in: " + allMeasuresOuter);

									}

								} else {

									logger.error("Could not parse the data received on this measure");

								}

							} else {

								logger.error("Could not get the data associated with this notification.");

							}

						});

					} else {

						if (!startdate) util.noParse("notification for enddate", ["body", "enddate"], req);
						if (!enddate) util.noParse("notification for startdate", ["body", "startdate"], req);

					}

				} else {

					logger.error("User listed in notification not found in database.");

				}

		  });

		} else {

			util.noParse("notification for user id", ["body", "userid"], req);

		}

		// Always send 200 to keep Nokia happy.
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
			req.session.oauth_request_token_secret = user.secret;
			req.session.oauth_refresh_token = user.refresh;
			req.session.save();

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

	return router;

};
