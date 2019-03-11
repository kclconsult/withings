const express = require('express');
const request = require('request');
const router = express.Router();
const config = require('config');

const util = require('../lib/util');
const nokiaUtil= require('../lib/nokiaUtil');
const models = require('../models');

function getData(req, res, user, address, action, extra_params, jsonID) {

	nokiaUtil.getData(req, res, user, address, action, extra_params, function(data) {

		console.log(data);

		if ( data.length > 0 ) {

			var parsedBody = JSON.parse(nokiaUtil.translateNokiaData(data))["body"][jsonID];

			for ( element in parsedBody ) {

				if ( parsedBody[element]["date"] != undefined ) {

			    if ( util.unixTimestamp(parsedBody[element]["date"]) ) {

            var date = new Date(parseInt(parsedBody[element]["date"]) * 1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            parsedBody[element]["date"] = formattedTime + " " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

          }

				}

			}

			res.send( JSON.stringify(parsedBody) );

		} else {

			res.send( "User not found." );

		}

	});

}

function queryAction(req, res, action) {

  models.users.findOne({

    where: {

      patientID: req.params.patientID

    }

  }).then(function(user) {

		params = {};
		getData(req, res, user, config.get('nokia_api_data.URLS')[action], action, params, config.get('nokia_api_data.TYPES')[action]);

  });

}

/**
 * @api {get} /:patientId Get the measure data associated with this patient.
 * @apiName patientMeasures
 * @apiGroup Dashboard
 *
 * @apiParam {Number} patientId The ID associated with a patient, and their data, within the system.
 *
 */
router.get('/:patientID', function(req, res, next) {

  queryAction(req, res, "getmeas");

});

/**
 * @api {get} /:patientId/:action Get the data associated with this patient.
 * @apiName patientMeasuresAction
 * @apiGroup Dashboard
 *
 * @apiParam {Number} patientId The ID associated with a patient, and their data, within the system.
 * @apiParam {string="getmeas", "getactivity", "getintradayactivity", "getsummary"} action Action to trigger data retrieval.
 *
 */
router.get('/:patientID/:action', function(req, res, next) {

  queryAction(req, res, req.params.action);

});

/**
 * @api {get} /:patientId/:action/:date Get the data associated with this patient on the specified date.
 * @apiName patientMeasuresActionDate
 * @apiGroup Dashboard
 *
 * @apiParam {Number} patientId The ID associated with a patient, and their data, within the system.
 * @apiParam {string="getmeas", "getactivity", "getintradayactivity", "getsummary"} action Action to trigger data retrieval.
 * @apiParam {Number} date A timestamp indicating the date on which the data should be gathered (Unix format e.g. 1551209506).
 *
 */
router.get('/:patientID/:action/:date', function(req, res, next) {

  var patientID = req.params.patientID;

  models.users.findOne({

    where: {

      patientID: patientID

    },

  }).then(function(user) {

    params = {};
    params["date"] = req.params.date;
		getData(req, res, user, config.get('nokia_api_data.URLS')[req.params.action], req.params.action, params, config.get('nokia_api_data.TYPES')[req.params.action]);

  });

});

/**
 * @api {get} /:patientId/:action/:start/:end Get the data associated with this patient within a specified time period.
 * @apiName patientMeasuresActionDateStartEnd
 * @apiGroup Dashboard
 *
 * @apiParam {Number} patientId The ID associated with a patient, and their data, within the system.
 * @apiParam {string="getmeas", "getactivity", "getintradayactivity", "getsummary"} action Action to trigger data retrieval.
 * @apiParam {Number} start A timestamp indicating the start of the time period in which data should be gathered (Unix format e.g. 1551209506).
 * @apiParam {Number} end A timestamp indicating the end of the time period in which data should be gathered (Unix format e.g. 1551209506).
 *
 * @apiExample {curl} Example usage:
 *     curl http://consult.hscr.kcl.ac.uk/nokia/dashboard/3/getintradayactivity/1551209506/1551294780
 */
router.get('/:patientID/:action/:start/:end', function(req, res, next) {

  var patientID = req.params.patientID;

  models.users.findOne({

    where: {

    	patientID: patientID

    },

  }).then(function(user) {

		// To accomodate different date formats for different endpoints.
    if ( !config.get('nokia_api_data.START')[req.params.action].includes("ymd") && (!util.unixTimestamp(req.params.start) || !util.unixTimestamp(req.params.end) ) ) {

      req.params.start = new Date(req.params.start).getTime() / 1000;
      req.params.end = new Date(req.params.end).getTime() / 1000;

    }

    params = {};
    params[config.get('nokia_api_data.START')[req.params.action]] = req.params.start;
    params[config.get('nokia_api_data.END')[req.params.action]] = req.params.end;
		getData(req, res, user, config.get('nokia_api_data.URLS')[req.params.action], req.params.action, params, config.get('nokia_api_data.TYPES')[req.params.action]);

  });

});

module.exports = router;
