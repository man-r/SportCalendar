(function () {

'use strict';

var app = angular.module('app',[]);

app.controller('Main', ['$scope', '$http', function (scope, http) {
	//doc.bind('deviceready', function(){
	//	self.getMatches('http://www.en.beinsports.net/tv-guide');
	//});

	scope.json;
	var offset = new Date().getTimezoneOffset()/-60;
	
	var self = {
		getMatches: function (url) {
			
			http({
				method: 'GET', 
				url: url})
			.success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available

				var lines=data.split("\n");
				var inputLine;
		        var startWriting = false;
		        
	        	var jsonObject = {};
		        var jsonArray = [];
		        
		        for(var i=0; i<lines.length; i++) {
					//alert(lines[i]);
					inputLine = lines[i];
	    			if (inputLine.indexOf("data-live=\"1\"") > -1){
		        		jsonObject = {};
		        		startWriting = true;
		        		
		        	}
		        	else if (inputLine.indexOf("data-live=\"0\"") > -1){
		        		startWriting = false;
		        	
		        	}

		        	if ( startWriting ) {
		        		
		        		if ( 
		        			(inputLine.indexOf("<div class=\"live\">Live</div>") < 0) &&
		        			(inputLine.indexOf("</a>") < 0) && 
		        			(inputLine.indexOf("</li>") < 0) && 
		        			(inputLine.indexOf("</ul>") < 0) 
		        			) {
		        			
		        			if (inputLine.indexOf("data-event=") > -1 ){
		        				jsonObject['id'] = self.getID(inputLine);
		        			}

		        			if (inputLine.indexOf("data-duration=") > -1 ){
		        				jsonObject['duration'] = self.getDuarion(inputLine);
		        			}

		        			if (inputLine.indexOf("<a href=\"/connect/") > -1 ){
		        				jsonObject['chanal'] = self.getChanal(inputLine);
		        			}

		        			if (inputLine.indexOf("title=") > -1 ){
		        				jsonObject['event'] = self.getEvent(inputLine);
		        				if (inputLine.indexOf("<br/>") > -1 ){
									jsonObject['notes'] = self.getEventNote(inputLine);
								}
								else {
									jsonObject['notes'] = '';
								}
		        			}

		         			if (inputLine.indexOf("timestamp") > -1 ){
		         				jsonObject['timestamp'] = self.getTimestamp(inputLine);
			         			
			         			jsonObject['endDate'] = new Date(jsonObject.timestamp.getTime() + jsonObject.duration*60000);
			         			if (!(jsonObject.event.indexOf('Sports News') > -1)) {
									if (!(jsonObject.chanal.indexOf('bein-sports-news') > -1)){
										var startDate = jsonObject.timestamp;
										var endDate = new Date(startDate.getTime() + jsonObject.duration*60000);

										if (endDate.getTime() > new Date().getTime()) {
											jsonArray.push(jsonObject);
											self.updateCalendar(jsonObject);
										}
									}
								}
								startWriting = false;
		        			}
		        			
		        		}
		        		
		        	}
		        	  
		        }

		        //alert('your calendar is now updated');
		        scope.json = jsonArray;
		        console.log(JSON.stringify(scope.json));
		        
			})
			.error(function(data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
				alert('error: \n' +data);
			});
		},

		updateCalendar: function(json) {
			if (json.event.indexOf('Sports News') > -1) {
				return;
			}
	        var title = json.event;
	        var location = json.chanal;
			var notes = json.notes;
			var startDate = json.timestamp;
			var endDate = new Date(startDate.getTime() + json.duration*60000);
			
			var success = function(message) { };
			var error = function(message) { alert(" createEvent Error: " + message); };
	        
	        if (endDate.getTime() > new Date().getTime()) {
	        	self.addToCalendar(title,location, notes, startDate, endDate, success, error);	
	        }
	        
        },
		addToCalendar: function(title, location, notes, startDate, endDate, successFn, errorFn) {
			// create an event silently (on Android < 4 an interactive dialog is shown)
			if (self.eventExist(title, location, notes, startDate, endDate)){
				var success = function(message) {};
				var error = function(message) { alert("DeleteEvent Error: " + message); };
				window.plugins.calendar.deleteEvent(title, location, notes, startDate, endDate,success,error);
			}
			window.plugins.calendar.createEvent(title,location,notes,startDate,endDate,successFn,errorFn);
		},

		eventExist: function (title, location, notes, startDate, endDate) {
			var exist = false;
			var success = function(message) {
				if (message.length > 0){
					exist = true;
				}
			};
			var error = function(message) { alert("findEvent Error: " + message); };
			window.plugins.calendar.findEvent(title,location,notes,startDate,endDate,success,error);
			return exist;
		},

		getDuarion: function (line){

			line = line.substring(line.indexOf("data-duration=") + 15);
			line = line.substring(0, line.indexOf("\""));

			return line;
		},

		getID: function (line) {
			line = line.substring(line.indexOf("data-event=") + 12);
			line = line.substring(0, line.indexOf('"'));
			return line;
		},

		getChanal: function (line) {
			line = line.substring(line.indexOf("<a href=\"/connect/") + 18);
			line = line.substring(0, line.indexOf("/\""));

			return line;
		},


		getEvent: function (line) {
			line = line.substring(line.indexOf("title=") + 10);
			line = line.substring(0, line.indexOf("<"));
			return line;
		},
		getEventNote: function(line) {
			line = line.substring(line.indexOf("event-category") + 16);
			line = line.substring(0, line.indexOf("</span>"));
			return line;
		},

		getTime : function (line) {
			line = line.substring(line.indexOf("datetime=") + 10);
			line = line.substring(0, line.indexOf("\""));

			return line;
		},

		getTimestamp : function (line) {
			line = line.substring(line.indexOf(">") + 1);
			line = line.substring(0, line.indexOf("<"));
			
			var d = new Date();
			d.setHours(parseInt(line.substring(0,line.indexOf(':'))) + offset);
			d.setMinutes(parseInt(line.substring(line.indexOf(':')+1)));
			return d;
		},

		pushNotificationSuccessHandler: function (result) {
			 alert('Callback Success! Result = '+ result);
		},

		pushNotificationErrorHandler: function (error) {
			alert(error);
		},

		onNotificationGCM: function (e) {
			switch( e.event ) {
				case 'registered':
					if ( e.regid.length > 0 ) {
						alert('registration id = '+e.regid);
					}
					break;
				case 'message':
					// this is the actual push notification. its format depends on the data model from the push server
					alert('message = '+e.message+' msgcnt = '+e.msgcnt);
					break;
				case 'error':
					alert('GCM error = '+e.msg);
					break;
				default:
					alert('An unknown GCM event has occurred');
					break;
			}
		}
	};

	scope.events = {
		getMatches: function () {
			var puship_id = '8h0Y3oTQ16xwUud';
			var your_sender_id = 'nimble-sight-819';
			Puship.PushipAppId = puship_id; // I.E.: puship_id = "h1mCVGaP9dtGnwG"

			if (Puship.Common.GetCurrentOs()==Puship.OS.ANDROID){
				var GCMCode = your_sender_id; // This is the senderID provided by Google. I.E.: "28654934133"
				Puship.GCM.Register(GCMCode,
				{
					successCallback: function (pushipresult){
						navigator.notification.alert("device registered with DeviceId:" + pushipresult.DeviceId);
					},
					failCallback: function (pushipresult){
						navigator.notification.alert("error during registration: "+ JSON.stringify(pushipresult));
					}
				});
			} else if (Puship.Common.GetCurrentOs()==Puship.OS.IOS){
				Puship.APNS.Register(
				{
					successCallback: function (pushipresult){
						navigator.notification.alert("device registered with DeviceId:" + pushipresult.DeviceId);
					},
					failCallback: function (pushipresult){
						navigator.notification.alert("error during registration: "+ JSON.stringify(pushipresult));
					}
				});
			} else if (Puship.Common.GetCurrentOs()==Puship.OS.WP){
				Puship.WP.Register(
				{
					successCallback: function (pushipresult){
						navigator.notification.alert("device registered with DeviceId:" + pushipresult.DeviceId);
					},
					failCallback: function (pushipresult){
						navigator.notification.alert("error during registration: "+ JSON.stringify(pushipresult));
					}
				});
			} else {
				Console.log("Not supported platform");
			}



			self.getMatches('http://www.en.beinsports.net/tv-guide');
		},
		removeFromCalendar: function(index) {
			var json = scope.json[index];
			var title = json.event;
	        var location = json.chanal;
			var notes = json.notes;
			var startDate = json.timestamp;
			var endDate = new Date(startDate.getTime() + json.duration*60000);
			
			var success = function(message) {
				scope.json.splice(index, 1);
				scope.$apply();
			};
			var error = function(message) { alert("DeleteEvent Error: " + message); };

			window.plugins.calendar.deleteEvent(title, location, notes, startDate, endDate,success,error);
		}
	};
	scope.test = function(item){
		alert(item);
	};
}]);

})();