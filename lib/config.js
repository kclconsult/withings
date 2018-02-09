module.exports = {
    NOKIA_CONSUMER_KEY: process.env.NOKIA_CONSUMER_KEY,
	NOKIA_SECRET: process.env.NOKIA_SECRET,
	CALLBACK_BASE: "http://martinchapman.co.uk",
	NOKIA_REQUEST_TOKEN_BASE: "https://developer.health.nokia.com/account/request_token",
	NOKIA_AUTHORISATION_BASE: "https://developer.health.nokia.com/account/authorize",
	NOKIA_ACCESS_TOKEN_BASE: "https://developer.health.nokia.com/account/access_token",
	SUBSCRIPTION_BASE: "https://api.health.nokia.com/notify",
	TYPES: { "getactivity": "activities", "getmeas": "measuregrps", "getintradayactivity": "activities" },
	URLS: { "getmeas": "https://api.health.nokia.com/measure", "getactivity": "https://api.health.nokia.com/v2/measure", "getintradayactivity": "https://api.health.nokia.com/v2/measure" },
	START: { "getmeas": "startdate", "getactivity": "startdateymd", "getintradayactivity": "startdate" },
	END: { "getmeas": "enddate", "getactivity": "enddateymd", "getintradayactivity": "enddate" }
};