const express = require('express');
const request = require('request');
const router = express.Router();
const async = require('async');
const uuidv1 = require('uuid/v1');
const config = require('config');

module.exports = function(messageObject) {

	/**
	 * @api {get} /simulate/simulateMass Simulate mass of incoming data values (currently does not exit).
	 * @apiName simulateMass
	 * @apiGroup Simulate
	 *
	 */
	router.get('/simulateMass', function(req, res, next) {

		async.forever(function(next) {

			messageObject.send(config.get('sensor_to_fhir.URL') + "convert/bp", 'x'.repeat(10*1024*1024)).then(() => next());

		});

	});

	/**
	 * @api {get} /simulate/incomingBP Simulate a set of incoming blood pressure values.
	 * @apiName simulateBP
	 * @apiGroup Simulate
	 *
	 */
	router.get('/incomingBP/:patientID', function(req, res, next) {

		simulatedBPValues = [[83,	107, 58],
													[83,	107, 58],
													[85,	96,	 66],
													[75,	143, 65],
													[75,	101, 63],
													[76,	138, 78],
													[70,	121, 75],
													[81,	117, 68],
													[76,	133, 51],
													[70,	100, 77],
													[79,	97,	74],
													[88,	107, 73],
													[86,	139, 63],
													[83,	124, 66],
													[74,	139, 69],
													[87,	113, 68],
													[78,	140, 69],
													[79,	124, 78],
													[82,	95,	53],
													[86,	129, 79],
													[82,	143, 62],
													[82,	136, 79],
													[80,	133, 55],
													[77,	130, 76],
													[86,	122, 65],
													[86,	142, 53]];

		async.eachSeries(simulatedBPValues, function (value, next){

			var json = {
				"reading": "BP",
				"id": uuidv1(),
				"subjectReference": req.params.patientID,
				"271650006": value[0],
				"271649006": value[1],
				"8867-4": value[2]
			};

			messageObject.send(config.get('sensor_to_fhir.URL') + "convert/bp", json).then(() => next());

		}, function(err) {

			res.sendStatus(200);

		});

	});

	return router;

}
