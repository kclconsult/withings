var express = require('express');
var router = express.Router();
const config = require('../lib/config');
const NokiaUtil = require('../lib/nokiaUtil');

router.get('/', function (req, res) {
	
	req.session.oauth_request_token = null;
	req.session.oauth_request_token_secret = null;
	
	NokiaUtil.genURLFromRequestToken(req, res, config.NOKIA_AUTHORISATION_BASE, function(url) {
		
		res.render('raw', { output: "<a href='" + url + "'>" + url + "</a>" } );
		
	});
	
	//res.end();
	
});

module.exports = router;