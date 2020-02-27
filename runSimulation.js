const request = require('request-promise')

async function callDeviceIntegration(patientId) {

  var options = {
    method: 'GET',
    uri: 'http://localhost:3000/nokia/simulate/amberDia/' + patientId,
  };

  return request(options);
}

async function interact() {

  await callDeviceIntegration("59ed03a0-4e8a-11ea-a606-395d1e44fcbe").then(function(body) {

    console.log(body);

  });

}

async function interactions() {

  for ( var i = 0; i < 100; i++ ) {

    await interact(ignore);

  }

}

interact();
