
var gcm = require('node-gcm');
var message = new gcm.Message();

//API Server Key
var sender = new gcm.Sender('AIzaSyDoEn5BKjJjtasnoPPTTPMATY1t5OF83cM');
var registrationIds = [];

//Value the payload data to send...
message.addData('message',"\u270C Peace, Love \u2764 and PhoneGap \u2706!");
message.addData('title','Push Notification Sample' );
message.addData('msgcnt','3'); // Shows up in the notification in the status bar
message.addData('soundname','beep.wav'); //Sound to play upon notification receipt - put in the www folder in app
//message.collapseKey = 'demo';
//message.delayWhileIdle = true; //Default is false
message.timeToLive = 3000;// Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.
 
// At least one reg id required
registrationIds.push('APA91bGmDFhcG6yg5d7_qQFlPhobcfxasNySeUi-giy1BwTV7grqNT9xgwqvVI-gNzO4gFSXCMK8dS1cJ4aRo-0f1RLl28wD5LIMleymFzssPRKzcGYQD0WUgKHjV29GbPZLvuxPG-ubD0ITHud_e-peGVJxIvbyuqo4e706mYPQWwExic4419k');

/**
 * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
 */

sender.send(message, registrationIds, 3, function (result) {
	console.log(result);
});