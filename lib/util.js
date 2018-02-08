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
			key_value[input.split("&")[entry].split("=")[0]] = input.split("&")[entry].split("=")[1]
		}
		
		return key_value;
		
	}
	
	static validateDate(strDate) {
		
		var t = /^(?=.+([\/.-])..\1)(?=.{10}$)(?:(\d{4}).|)(\d\d).(\d\d)(?:.(\d{4})|)$/;

		strDate.replace(t, function($, _, y, m, d, y2) {
	    
			$ = new Date(y = y || y2, m, d);
		    
			t = $.getFullYear() != y || $.getMonth() != m || $.getDate() != d;
		
		});
		
		return !t;

	}
}

module.exports = Util;