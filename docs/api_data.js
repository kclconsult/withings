define({ "api": [
  {
    "type": "get",
    "url": "/:patientId",
    "title": "Get the measure data associated with this patient.",
    "name": "patientMeasures",
    "group": "Dashboard",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "patientId",
            "description": "<p>The ID associated with a patient, and their data, within the system.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./routes/dashboard.js",
    "groupTitle": "Dashboard"
  },
  {
    "type": "get",
    "url": "/:patientId/:action",
    "title": "Get the data associated with this patient.",
    "name": "patientMeasuresAction",
    "group": "Dashboard",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "patientId",
            "description": "<p>The ID associated with a patient, and their data, within the system.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"getmeas\"",
              "\"getactivity\"",
              "\"getintradayactivity\"",
              "\"getsummary\""
            ],
            "optional": false,
            "field": "action",
            "description": "<p>Action to trigger data retrieval.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./routes/dashboard.js",
    "groupTitle": "Dashboard"
  },
  {
    "type": "get",
    "url": "/:patientId/:action/:date",
    "title": "Get the data associated with this patient on the specified date.",
    "name": "patientMeasuresActionDate",
    "group": "Dashboard",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "patientId",
            "description": "<p>The ID associated with a patient, and their data, within the system.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"getmeas\"",
              "\"getactivity\"",
              "\"getintradayactivity\"",
              "\"getsummary\""
            ],
            "optional": false,
            "field": "action",
            "description": "<p>Action to trigger data retrieval.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "date",
            "description": "<p>A timestamp indicating the date on which the data should be gathered.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./routes/dashboard.js",
    "groupTitle": "Dashboard"
  },
  {
    "type": "get",
    "url": "/:patientId/:action/:start/:end",
    "title": "Get the data associated with this patient within a specified time period.",
    "name": "patientMeasuresActionDateStartEnd",
    "group": "Dashboard",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "patientId",
            "description": "<p>The ID associated with a patient, and their data, within the system.</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "allowedValues": [
              "\"getmeas\"",
              "\"getactivity\"",
              "\"getintradayactivity\"",
              "\"getsummary\""
            ],
            "optional": false,
            "field": "action",
            "description": "<p>Action to trigger data retrieval.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "start",
            "description": "<p>A timestamp indicating the start of the time period in which data should be gathered.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "end",
            "description": "<p>A timestamp indicating the end of the time period in which data should be gathered.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl http://consult.hscr.kcl.ac.uk/nokia/dashboard/3/getintradayactivity/1551209506/1551294780",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "./routes/dashboard.js",
    "groupTitle": "Dashboard"
  },
  {
    "type": "get",
    "url": "/register/:patientId",
    "title": "Register a patient ID against a device.",
    "name": "registerPatient",
    "group": "Register",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "patientId",
            "description": "<p>The ID associated with a patient, and their data, within the system.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./routes/register.js",
    "groupTitle": "Register"
  },
  {
    "type": "get",
    "url": "/simulate/incomingBP",
    "title": "Simulate a set of incoming blood pressure values.",
    "name": "simulateBP",
    "group": "Simulate",
    "version": "0.0.0",
    "filename": "./routes/simulate.js",
    "groupTitle": "Simulate"
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./docs/main.js",
    "group": "_home_martin_Dropbox_University_Postdoctoral_Associate_2017_18_Research_CONSULT_Sensor_dev_device_integration_nokia_docs_main_js",
    "groupTitle": "_home_martin_Dropbox_University_Postdoctoral_Associate_2017_18_Research_CONSULT_Sensor_dev_device_integration_nokia_docs_main_js",
    "name": ""
  }
] });
