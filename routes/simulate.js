var express = require('express');
var request = require('request');
var router = express.Router();
const config = require('../lib/config');
var models = require('../models');
var async = require('async');

/**
 * @api {get} /simulate/incomingBP Simulate a set of incoming blood pressure values.
 * @apiName simulateBP
 * @apiGroup Simulate
 *
 */
router.get('/incomingBP', function(req, res, next) {

		simulatedBPValues = [["3", 83,	107, 58],
													["3",	83,	107, 58],
													["3",	85,	96,	 66],
													["3",	75,	143, 65],
													["3",	75,	101, 63],
													["3",	76,	138, 78],
													["3",	70,	121, 75],
													["3",	81,	117, 68],
													["3",	76,	133, 51],
													["3",	70,	100, 77],
													["3",	79,	97,	74],
													["3",	88,	107, 73],
													["3",	86,	139, 63],
													["3",	83,	124, 66],
													["3",	74,	139, 69],
													["3",	87,	113, 68],
													["3",	78,	140, 69],
													["3",	79,	124, 78],
													["3",	82,	95,	53],
													["3",	86,	129, 79],
													["3",	82,	143, 62],
													["3",	82,	136, 79],
													["3",	80,	133, 55],
													["3",	77,	130, 76],
													["3",	86,	122, 65],
													["3",	86,	142, 53]];

		async.eachSeries(simulatedBPValues, function (value, next){

				request.post(config.SENSOR_TO_FHIR_URL + "convert/bp", {

						json: {

								id: "t" + Date.now(),
								subjectReference: value[0],
								271650006: value[1],
								271649006: value[2],
								"8867-4": value[3]

						},

				},
				function (error, response, body) {

						if (!error && response.statusCode == 200) {

								 console.log(response.body)

						} else {

								 console.log(error)

						}

						next();

				});

		}, function(err) {

					res.sendStatus(200);

		});

});

/**
 * @api {get} /simulate/incomingHR Simulate a set of incoming (separate from BP) heart rate values.
 * @apiName simulateHR
 * @apiGroup Simulate
 *
 */
router.get('/incomingHR', function(req, res, next) {

		simulatedHRValues = [["3", 82,	92],
												 ["3", 77,	87],
												 ["3", 79,	89],
												 ["3", 79,	89],
												 ["3", 86,	96],
												 ["3", 87,	97],
												 ["3", 79,	89],
												 ["3", 98,	108],
												 ["3", 107,	117],
												 ["3", 98,	108],
												 ["3", 104,	114],
												 ["3", 97,	107],
												 ["3", 94,	104],
												 ["3", 82,	92],
												 ["3", 105,	115],
												 ["3", 88,	98],
												 ["3", 84,	94],
												 ["3", 97,	107],
												 ["3", 94,	104],
												 ["3", 96,	106],
												 ["3", 97,	107],
												 ["3", 86,	96],
												 ["3", 97,	107],
												 ["3", 93, 103],
												 ["3", 81,	91],
												 ["3", 87,	97]];

		async.eachSeries(simulatedHRValues, function (value, next){

				request.post(config.SENSOR_TO_FHIR_URL + "convert/hr", {

						json: {

								id: "t" + Date.now(),
								subjectReference: value[0],
								restingHeartRateInBeatsPerMinute: value[1],
								maxHeartRateInBeatsPerMinute: value[2],

						},

				},
				function (error, response, body) {

						if (!error && response.statusCode == 200) {

								 console.log(response.body)

						} else {

								 console.log(error)

						}

						next();

				});

		}, function(err) {

					res.sendStatus(200);

		});

});

module.exports = router;
