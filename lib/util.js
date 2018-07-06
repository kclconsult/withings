const request = require('request');

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
}

module.exports = Util;
