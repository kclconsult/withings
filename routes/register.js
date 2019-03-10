const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const config = require('../lib/config');
const NokiaUtil = require('../lib/nokiaUtil');
const Util = require('../lib/util');

const NOKIA_CALLBACK = config.CALLBACK_BASE + "/nokia/connect/callback";

/**
 * @api {get} /register/:patientId Register a patient ID against a device.
 * @apiName registerPatient
 * @apiGroup Register
 *
 * @apiParam {Number} patientId The ID associated with a patient, and their data, within the system.
 *
 */
router.get('/:patientID', function (req, res) {

  req.session.patientID = req.params.patientID;
	req.session.oauth_request_token = null;
	req.session.oauth_request_token_secret = null;
	req.session.save();

	if (config.OAUTH_VERSION == 2) {

    crypto.randomBytes(16, function(err, buffer) {

      var state = buffer.toString('hex');

      var url = config.NOKIA_AUTHORISATION_BASE_V2 + "?response_type=code&redirect_uri=" + NOKIA_CALLBACK + "&client_id=" + config.NOKIA_CLIENT_ID + "&scope=user.info,user.metrics,user.activity&state=" + state;

      res.redirect(url);

    });

	} else {

    NokiaUtil.genURLFromRequestToken(req, res, config.NOKIA_AUTHORISATION_BASE, function(url) {

      res.redirect(url);

    });

	}

});

module.exports = router;
