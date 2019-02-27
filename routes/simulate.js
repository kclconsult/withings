var express = require('express');
var request = require('request');
var router = express.Router();
const config = require('../lib/config');
var models = require('../models');
var async = require('async');

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

						// TODO: Separate call to new SENSOR_TO_FHIR endpoint to construct FHIR resource for HR.

						next();

				});

		}, function(err) {

					res.sendStatus(200);

		});

});

module.exports = router;
