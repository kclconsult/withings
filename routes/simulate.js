var express = require('express');
var request = require('request');
var router = express.Router();
const config = require('../lib/config');
var models = require('../models');
var async = require('async');

router.get('/incomingBP', function(req, res, next) {

		simulatedBPValues = [["p1234", 83,	107, 58],
													["p123",	83,	107, 58],
													["p123",	85,	96,	 66],
													["p123",	75,	143, 65],
													["p123",	75,	101, 63],
													["p123",	76,	138, 78],
													["p123",	70,	121, 75],
													["p123",	81,	117, 68],
													["p123",	76,	133, 51],
													["p123",	70,	100, 77],
													["p123",	79,	97,	74],
													["p123",	88,	107, 73],
													["p123",	86,	139, 63],
													["p123",	83,	124, 66],
													["p123",	74,	139, 69],
													["p123",	87,	113, 68],
													["p123",	78,	140, 69],
													["p123",	79,	124, 78],
													["p123",	82,	95,	53],
													["p123",	86,	129, 79],
													["p123",	82,	143, 62],
													["p123",	82,	136, 79],
													["p123",	80,	133, 55],
													["p123",	77,	130, 76],
													["p123",	86,	122, 65],
													["p123",	86,	142, 53]];

		async.eachSeries(simulatedBPValues, function (value, next){

				console.log(value);

				request.post(config.SENSOR_TO_FHIR_URL, {

						json: {

								type: "bp",
								value: value

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
