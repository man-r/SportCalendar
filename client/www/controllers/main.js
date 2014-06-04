(function () {

'use strict';

var app = angular.module('app');

app.controller('Main', ['$document', '$scope', 'main','$http', function (doc, scope, model,http) {
	doc.bind('deviceready', function(){
		self.getMatches('http://www.en.beinsports.net/tv-guide');
	});

	scope.json;
	var self = {
		getMatches: function (url) {
			// body...
			http({
				method: 'GET', 
				url: url})
			.success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available

				alert('success');
				var lines=data.split("\n");
				var inputLine;
		        var startWriting = false;
		        
	        	var jsonObject = {};
		        var jsonArray = [];
		        //alert(lines.length + " lines");
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
		        		//alert(inputLine);
		        		if (//(inputLine.indexOf("<a ")<0) && 
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

		        			if (inputLine.indexOf("<a href=\"/watch-live") > -1 ){
		        				jsonObject['chanal'] = self.getChanal(inputLine);
		        			}

		        			if (inputLine.indexOf("<div>") > -1 ){
		        				jsonObject['event'] = self.getEvent(inputLine);
		        				if (inputLine.indexOf("<br/>") > -1 ){
									jsonObject['notes'] = self.getEventNote(inputLine);
								}
								else {
									jsonObject['notes'] = '';
								}
		        			}

		        			if (inputLine.indexOf("<time") > -1 ){
		        				jsonObject['time'] = self.getTime(inputLine);
		        			}

		         			if (inputLine.indexOf("timestamp") > -1 ){
		         				jsonObject['timestamp'] = self.getTimestamp(inputLine);
		         			}


		        			if (inputLine.indexOf("</time>") > -1) {

								if (!(jsonObject.event.indexOf('Sports News') > -1)) {
									if(new Date(jsonObject.timestamp * 1000).getTime() > new Date().getTime()){
										jsonArray.push(jsonObject);
										self.updateCalendar(jsonObject);
		        					}
								}
		        				startWriting = false;
		        			}
		        			
		        		}
		        		
		        	}
		        	  
		        }

		        alert('done');
		        scope.json = jsonArray;
		        
		        scope.$apply();
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
			var startDate = new Date(json.timestamp * 1000);
			var endDate = new Date(startDate.getTime() + json.duration*60000);
				
			var success = function(message) { };
			var error = function(message) { alert(" createEvent Error: " + message); };
	        
	        self.addToCalendar(title,location, notes, startDate, endDate, success, error);
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
			line = line.substring(line.indexOf("watch-live/") + 11);
			line = line.substring(0, line.indexOf("/\""));

			return line;
		},


		getEvent: function (line) {
			line = line.substring(line.indexOf("<div>") + 5);
			if (line.indexOf("<br/>") > -1 ){
				line = line.substring(0, line.indexOf("<"));
			}
			return line;
		},
		getEventNote: function(line) {
			line = line.substring(line.indexOf("<br/><span>") + 11);
			line = line.substring(0, line.indexOf("</span>"));
			return line;
		},

		getTime : function (line) {
			line = line.substring(line.indexOf("datetime=") + 10);
			line = line.substring(0, line.indexOf("\""));

			return line;
		},

		getTimestamp : function (line) {
			line = line.substring(line.indexOf("timestamp=") + 11);
			line = line.substring(0, line.indexOf("\""));

			return line;
		}
	};

	scope.model = model;
	scope.events = {};
}]);

})();