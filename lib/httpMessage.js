const request = require('request');

// Send message via http
class HTTPMessage {

  send(url, body) {

    return new Promise(
      
      (resolve, reject) => {

        request.post(url, { json: body }, function(error, response, data) {

          if (!error && response.statusCode == 200) {

            console.log(response.body);
            resolve(response.body);

          } else {

            console.log(error);
            resolve(error);

          }

       });

    });

  }

}

module.exports = HTTPMessage;
