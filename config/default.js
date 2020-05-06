module.exports = {
  message_queue: {
    ACTIVE: "false"
  },
  dbConfig: {
    dialect: "sqlite",
    storage: "db.test.sqlite"
  },
  credentials: {
    USERNAME: process.env.USERNAME,
    PASSWORD: process.env.PASSWORD
  },
  nokia_api_auth: {
    NOKIA_CONSUMER_KEY: process.env.NOKIA_CONSUMER_KEY,
    NOKIA_CLIENT_ID: process.env.NOKIA_CLIENT_ID,
  	NOKIA_SECRET: process.env.NOKIA_SECRET,
  	NOKIA_CONSUMER_SECRET: process.env.NOKIA_CONSUMER_SECRET
  },
  nokia_api: {
    CALLBACK_BASE: "https://device.consultproject.co.uk",
  	NOKIA_REQUEST_TOKEN_BASE: "https://developer.health.nokia.com/account/request_token",
  	NOKIA_AUTHORISATION_BASE: "https://developer.health.nokia.com/account/authorize",
  	NOKIA_AUTHORISATION_BASE_V2: "https://account.withings.com/oauth2_user/authorize2",
  	NOKIA_ACCESS_TOKEN_BASE: "https://developer.health.nokia.com/account/access_token",
  	NOKIA_ACCESS_TOKEN_BASE_OAUTH2: "https://account.withings.com/oauth2/token",
    SUBSCRIPTION_BASE: "https://wbsapi.withings.net/notify",
    OAUTH_VERSION: 2,
  	CONVERT_OAUTH: false
  },
  nokia_api_data: {
    TYPES: { "getmeas": "measuregrps", "getactivity": "activities", "getintradayactivity": "series", "getsummary": "" },
  	URLS: { "getmeas": "https://wbsapi.withings.net/measure", "getactivity": "https://wbsapi.withings.net/v2/measure", "getintradayactivity": "https://wbsapi.withings.net/v2/measure", "getsummary": "https://wbsapi.withings.net/v2/sleep" },
  	START: { "getmeas": "startdate", "getactivity": "startdateymd", "getintradayactivity": "startdate", "getsummary": "startdateymd" },
  	END: { "getmeas": "enddate", "getactivity": "enddateymd", "getintradayactivity": "enddate", "getsummary": "enddateymd" },
  }
};
