// Send message via message queue
class QueueMessage {

  constructor(connection, queue) {
    this.connection = connection;
    this.queue = queue;
  }

  send(url, body) {

    let queue = this.queue;

    return this.connection.createChannel().then(function(channel) {

      var ok = channel.assertQueue(queue);

      return ok.then(function(queueOK) {

        var response = channel.sendToQueue(queue, Buffer.from(JSON.stringify(body)));

        if ( !response ) {

          console.log("Not ready to send yet.");

          // Handle queue that is not ready for new messages yet: https://github.com/squaremo/amqp.node/issues/61
          channel.once('drain', function() {

            console.log("Ready!");
            return channel.close();

          });

        } else {

          return channel.close();

        }

      });

    });

  }

}

module.exports = QueueMessage;
