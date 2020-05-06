const express = require('express');
const request = require('request');
const router = express.Router();
const async = require('async');
const { v1: uuidv1 } = require('uuid');
const config = require('config');
const parse = require('csv-parse');
const fs = require('fs');

const PRACTITIONER_ID = "da6da8b0-56e5-11e9-8d7b-95e10210fac3";

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

		res.send("Please supply at least patient ID, or patient ID and practitioner ID.");

	});

	function sendBPData(simulationType, patientID, practitionerID, callback) {

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
					jsonRow.subjectReference = patientID;
					jsonRow.practitionerReference = practitionerID;

					row.forEach(function(entry) {

						jsonRow[headers[row.indexOf(entry)]] = entry;

					});

					messageObject.send(config.get('sensor_to_fhir.URL') + "/create/bp", jsonRow).then(() => next());

				}, function(err) {

					callback(200);

				});

			} else {

				console.error("Data not supplied in a suitable format");

			}

		});

		const SIMULATION_PATH = "routes/sample-data/" + simulationType + ".csv";

		if ( fs.existsSync(SIMULATION_PATH) ) {

			fs.createReadStream(SIMULATION_PATH).pipe(parser);

		} else {

			callback(404);

		}

	}

	/**
	 * @api {get} /simulate/:simulationType/:patientID/:practitionerID Simulate a set of incoming blood pressure values or a specific BP alert.
	 * @apiName simulateBP
	 * @apiGroup Simulate
	 *
	 * @apiParam {String} simulationType [incomingBP|amberDia|amberSys|amberDiaSys|redDia|redSys|redDiaSys|doubleRedDia|doubleRedSys|doubleRedDiaSys]
	 * @apiParam {String} patientID Patient unique ID.
	 * @apiParam {String} practitionerID Practitioner unique ID.
	 */
	router.get('/:simulationType/:patientID/:practitionerID', function(req, res, next) {

		sendBPData(req.params.simulationType, req.params.patientID, req.params.practitionerID, function(status) {

			res.sendStatus(status);

		});

	});

	/**
	 * @api {get} /simulate/:simulationType/:patientID/:practitionerID Simulate a set of incoming blood pressure values or a specific BP alert.
	 * @apiName simulateBP
	 * @apiGroup Simulate
	 *
	 * @apiParam {String} simulationType [incomingBP|amberDia|amberSys|amberDiaSys|redDia|redSys|redDiaSys|doubleRedDia|doubleRedSys|doubleRedDiaSys]
	 * @apiParam {String} patientID Patient unique ID.
	 */
	router.get('/:simulationType/:patientID', function(req, res, next) {

		sendBPData(req.params.simulationType, req.params.patientID, PRACTITIONER_ID, function(status) {

			res.sendStatus(status);

		});

	});

	return router;

};
