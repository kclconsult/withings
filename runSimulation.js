const request = require('request-promise');
const fs = require('fs');

async function callDeviceIntegration(patientId, type) {

  var options = {
    method: 'GET',
    uri: 'http://localhost:3000/nokia/simulate/' + type + '/' + patientId,
  };

  return request(options);
}

async function interact() {

  files = fs.readdirSync('routes/sample-data');

  await callDeviceIntegration("59ed03a0-4e8a-11ea-a606-395d1e44fcbe", files[Math.floor(Math.random() * files.length)].replace(".csv", "")).then(function(body) {

    console.log(body);

  });

}

async function interactions() {

  for ( var i = 0; i < 500; i++ ) {

    console.log("Running simulation: " + i);
    await interact();

  }

}

interactions();
