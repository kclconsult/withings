const request = require('request');
const logger = require('../config/winston');

class Util {

	static sortObject(o) {

    var sorted = {}, key, a = [];

    for (key in o) {

        if (o.hasOwnProperty(key)) {

        	a.push(key);

				}

    }

    a.sort();

    for (key = 0; key < a.length; key++) {

        sorted[a[key]] = o[a[key]];

		}

    return sorted;

	}

	static processKeyValue(input) {

		if ( !input || input.indexOf("&") < 0 ) return false;

		var key_value = [];

		for ( var entry in input.split("&") ) {

			key_value[input.split("&")[entry].split("=")[0]] = input.split("&")[entry].split("=")[1];

		}

		return key_value;

	}

	static unixTimestamp(input) {

		return (input + "").match(/^[0-9]+$/) != null;

	}

	static postRequest(URL, body, callback) {

    request({

      url: URL,
      headers: {
        'Content-Length': body.length,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      body: body,

    }, function (error, response, body) {

      callback(error, response, body);

    });

	}

	static JSONParseWrapper(string) {

		if (!string) return false;

    var parsed;

    try {

      parsed = JSON.parse(string);

    } catch(e) {

      logger.error("Could not parse: " + ( typeof string === "object" ? JSON.stringify(string) : string ) + ": " + e);
      return false;

    }

    return parsed;

  }

	// Does the item at the end of the path specified exist? If so, return it.
  static validPath(object, path) {

    if (!object) return false;

    for (var child in path) {

      if ( object[path[child]] ) {

        object = object[path[child]];

      } else {

        logger.error("Valid path check error. " + path[child] + " not in " + JSON.stringify(object).substring(0, 300));
        return false

      }

    }

    return object;

  }

	static noParse(target, path, object) {

    var pathInfo = "";
    if ( path.length > 0 ) pathInfo =  path.toString() + " not a valid path in ";
    logger.error("Could not parse " + target + ". " + pathInfo + ( typeof object === "object" ? JSON.stringify(object).substring(0, 300) : object))

  }

}

module.exports = Util;
