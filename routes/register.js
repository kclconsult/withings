var express = require('express');
var router = express.Router();
const config = require('../lib/config');
const NokiaUtil = require('../lib/nokiaUtil');
const Util = require('../lib/util');
const crypto = require('crypto');
const NOKIA_CALLBACK = config.CALLBACK_BASE + "/nokia/connect/callback";

function renderURL(res, url) {
    
    res.render('raw', { output: "<a href='" + url + "'>" + url + "</a>" } );
    
}

router.get('/', function (req, res) {
	
	req.session.oauth_request_token = null;
	req.session.oauth_request_token_secret = null;
	req.session.save();
	
	if (config.OAUTH_VERSION == 2) {
	    
	    crypto.randomBytes(16, function(err, buffer) {
	        
	        var state = buffer.toString('hex');
	    
	        var url = config.NOKIA_AUTHORISATION_BASE_V2 + "?response_type=code&redirect_uri=" + NOKIA_CALLBACK + "&client_id=" + config.NOKIA_CLIENT_ID + "&scope=user.info,user.metrics,user.activity&state=" + state;
	        
	        renderURL(res, url);
	    
	    });
	    
	} else {
	    
	    NokiaUtil.genURLFromRequestToken(req, res, config.NOKIA_AUTHORISATION_BASE, function(url) {
	        
	        renderURL(res, url);
	        
	    });
	    
	}
	
});

module.exports = router;