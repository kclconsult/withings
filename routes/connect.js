const express = require('express');
const router = express.Router();
const request = require('request');
const querystring = require('querystring');
const models = require('../models');
const logger = require('../config/winston');

const config = require('config');
const util = require('../lib/util');
const nokiaUtil = require('../lib/nokiaUtil');

const NOKIA_CALLBACK = config.get('nokia_api.CALLBACK_BASE') + "/nokia/connect/callback";

function subscribeNotifications(req, res, callback) {

  params = {};
  params["action"] = "subscribe";
  params["user_id"] = req.query.userid;
  params["callbackurl"] = querystring.escape(config.get('nokia_api.CALLBACK_BASE') + "/nokia/notify");
  params["comment"] = "comment";
  params["appli"] = 4;

  nokiaUtil.notificationSubscribe(req, res, params, function() {

    callback(200);

  });

}

function storeAccessToken(req, res, callback) {

  models.users.findOrCreate({

    where: {

      nokiaID: req.query.userid

    },
    defaults: {

      patientID: req.session.patientID,
      nokiaID: req.query.userid,
      token: req.session.oauth_request_token,
      secret: req.session.oauth_request_token_secret,
      refresh: req.session.oauth_refresh_token

    }

  }).error(function(err) {

    logger.error(err);

  }).then(function() {

    if ( config.get('nokia_api.CONVERT_OAUTH') ) {

      var form = {
        "grant_type": "refresh_token",
        "client_id": config.get('nokia_api_auth.NOKIA_CLIENT_ID'),
        "client_secret": config.get('nokia_api_auth.NOKIA_CONSUMER_SECRET'),
        "refresh_token": req.session.oauth_request_token  + ":" + req.session.oauth_request_token_secret
      };

      var formData = querystring.stringify(form);

      util.postRequest(config.get('nokia_api.NOKIA_ACCESS_TOKEN_BASE_OAUTH2'), formData, function(error, response, body) {

        logger.error(error + " " + JSON.stringify(response) + " " + body);

        util.postRequest(config.get('nokia_api.NOKIA_ACCESS_TOKEN_BASE_OAUTH2'), body, function(error, response, body) {

          subscribeNotifications(req, res, callback);

        });

      });

    } else {

      subscribeNotifications(req, res, callback);

    }

  });

}

router.get('/callback', function (req, res) {

  if ( config.get("nokia_api.OAUTH_VERSION") == 2 ) {

    var body = {
      "grant_type": "authorization_code",
      "client_id": config.get('nokia_api_auth.NOKIA_CLIENT_ID'),
      "client_secret": config.get('nokia_api_auth.NOKIA_CONSUMER_SECRET'),
      "code": req.query.code,
      "redirect_uri": NOKIA_CALLBACK
    };

    var bodyData = querystring.stringify(body);

    util.postRequest(config.get('nokia_api.NOKIA_ACCESS_TOKEN_BASE_OAUTH2'), bodyData, function(error, response, body) {

      if ( !error && body && ( parsedBody = util.JSONParseWrapper(body) ) ) {

        req.session.oauth_request_token = parsedBody["access_token"];
        req.session.oauth_request_token_secret = "";
        req.session.oauth_refresh_token = parsedBody["refresh_token"];
        req.session.save();

        // ~MDC Hack for compatibility with OAuth 1.
        req.query.userid = parsedBody["userid"];

        storeAccessToken(req, res, function(status) {

          res.sendStatus(status);

        });

      } else {

        logger.error("Unable to parse response to request for access token: " + error + " " + ( ( body && typeof body === "object" ) ? JSON.stringify(body) : "" ));
        res.sendStatus(400);

      }

    });

  } else {

    nokiaUtil.genURLFromRequestToken(req, res, config.get('nokia_api.NOKIA_ACCESS_TOKEN_BASE'), function(url) {

      // Request access token using generated URL.
      request(url, function (error, response, body) {

        if ( !error && body && ( responseKeyValue = util.processKeyValue(body) ) ) {

          // Is overwritten with updated access token for final call (~MDC there's a neater way to do this).
          req.session.oauth_request_token = util.processKeyValue(body)['oauth_token'];
          req.session.oauth_request_token_secret = util.processKeyValue(body)['oauth_token_secret'];
          req.session.save();

          storeAccessToken(req, res, function(status) {

            res.sendStatus(status);

          });

        } else {

          logger.error("Unable to parse response to request for access token: " + error + " " + ( ( body && typeof body === "object" ) ? JSON.stringify(body) : "" ));
          res.sendStatus(400);

        }

      });

    });

  }

});

module.exports = router;
