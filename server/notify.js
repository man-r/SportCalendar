// Create a new GCM sender.
var gcm = require('push-notify').gcm({
  apiKey: 'AIzaSyDoEn5BKjJjtasnoPPTTPMATY1t5OF83cM',
  retries: 3
});

gcm.on('transmissionError', function (error, message, registrationId) {
	console.log(error);
});

gcm.on('transmitted', function (result, message, registrationId) {
	console.log(result);
	console.log(message);
});
// Send a notification.
gcm.send({
  registrationId: 'APA91bFirbJiPqnfiiKOkUFZsFuUTalppR6PF0d8fVDPUdQ1miE7bZEO-h0vuCYlCg3c-gvppq96UUp_0scZXiCijkA7rs_E5hsUNouyTUepFxTBLeT_kW-rp6dAw4zfjFlFQWmtbP8unNHq0CWf4_h9qJLWLdEfcMNmk-hz3dNJDgoKXU02xPc',
  collapseKey: 'demo',
  //delayWhileIdle: false,
  timeToLive: 3,
  data: {
    message: 'message1',
    title: 'message2'
  }
});

