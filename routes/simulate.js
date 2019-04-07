const express = require('express');
const request = require('request');
const router = express.Router();
const async = require('async');
const uuidv1 = require('uuid/v1');
const config = require('config');
const parse = require('csv-parse');
const fs = require('fs');

module.exports = function(messageObject) {

	/**
	 * @api {get} /simulate/simulateMass Simulate mass of incoming data values (currently does not exit).
	 * @apiName simulateMass
	 * @apiGroup Simulate
	 *
	 */
	router.get('/simulateMass', function(req, res, next) {

		async.forever(function(next) {

			messageObject.send(config.get('sensor_to_fhir.URL') + "/create/bp", 'x'.repeat(10*1024*1024)).then(() => next());

		});

	});

	router.get('/incomingBP', function(req, res, next) {

		res.send("Please supply patient and practitioner ID.");

	});

	/**
	 * @api {get} /simulate/incomingBP/:patientID/:practitionerID Simulate a set of incoming blood pressure values.
	 * @apiName simulateBP
	 * @apiGroup Simulate
	 *
	 * @apiParam {String} patientID Patient unique ID.
	 * @apiParam {String} practitionerID Practitioner unique ID.
	 */
	router.get('/incomingBP/:patientID/:practitionerID', function(req, res, next) {

		const parser = parse({delimiter: ' '}, function (err, data) {

			if ( data ) {

				dataArray = [];

		    data.forEach(function(row) {

					dataArray.push(row);

				});

				headers = dataArray.shift();

				async.eachSeries(dataArray, function (row, next){

					var jsonRow = {};

					jsonRow.reading = "BP";
					jsonRow.id = uuidv1();
					jsonRow.subjectReference = req.params.patientID;
					jsonRow.practitionerReference = req.params.practitionerID;

					row.forEach(function(entry) {

						jsonRow[headers[row.indexOf(entry)]] = entry;

					});

					messageObject.send(config.get('sensor_to_fhir.URL') + "/create/bp", jsonRow).then(() => next());

				}, function(err) {

					res.sendStatus(200);

				});

			} else {

				console.error("Data not supplied in suitable format");

			}

		});

		fs.createReadStream("routes/data/bp.csv").pipe(parser);

	});

	return router;

}
