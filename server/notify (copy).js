//need to install: npm install node-gcm

var gcm = require('node-gcm');
var message = new gcm.Message();

//API Server Key
var sender = new gcm.Sender('AIzaSyDoEn5BKjJjtasnoPPTTPMATY1t5OF83cM');
var registrationIds = [];

//Value the payload data to send...
message.addData('message',"man-232edwqde!");
message.addData('title','Push Notification Sample33' );
message.addData('msgcnt','4'); // Shows up in the notification in the status bar
//message.addData('soundname','beep.wav'); //Sound to play upon notification receipt - put in the www folder in app
message.collapseKey = 'demo';
//message.delayWhileIdle = true; //Default is false
message.timeToLive = 3000;// Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.
 
// At least one reg id required
registrationIds.push('APA91bGmDFhcG6yg5d7_qQFlPhobcfxasNySeUi-giy1BwTV7grqNT9xgwqvVI-gNzO4gFSXCMK8dS1cJ4aRo-0f1RLl28wD5LIMleymFzssPRKzcGYQD0WUgKHjV29GbPZLvuxPG-ubD0ITHud_e-peGVJxIvbyuqo4e706mYPQWwExic4419k');
registrationIds.push('APA91bFirbJiPqnfiiKOkUFZsFuUTalppR6PF0d8fVDPUdQ1miE7bZEO-h0vuCYlCg3c-gvppq96UUp_0scZXiCijkA7rs_E5hsUNouyTUepFxTBLeT_kW-rp6dAw4zfjFlFQWmtbP8unNHq0CWf4_h9qJLWLdEfcMNmk-hz3dNJDgoKXU02xPc');

/**
 * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
 */

sender.send(message, registrationIds, 3, function (result) {
	console.log(result);
});