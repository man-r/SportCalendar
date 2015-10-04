(function () {

'use strict';

var app = angular.module('app');

app.controller('Main', ['$document', '$scope', 'main','$http', function (doc, scope, model,http) {
	//doc.bind('deviceready', function(){
	//	self.getMatches('http://www.en.beinsports.net/tv-guide');
	//});

	scope.json;
	var offset = new Date().getTimezoneOffset()/-60;
	
	var kooora = {
		getTimestamp : function (inputLine) {
			var line = inputLine.substring(inputLine.indexOf(":") - 2);
			line = line.substring(0, 5);
			return line;
		},

		getNote: function (inputLine) {
			var note = inputLine.substring(inputLine.indexOf(",\"") + 2);
			if (note.indexOf("<span") > -1 ) {
				note = note.substring(0, note.indexOf("<span"));
			} else {
				note = note.substring(0, note.indexOf("\""));
			}
			
			console.log(note);
			return note;
		},
		getEvent: function(inputLine) {
			
			var event = inputLine.substring(inputLine.indexOf(',') + 1);
			
			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			
			var team1 = event.substring(event.indexOf('"') + 1, event.indexOf('",'));

			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			event = event.substring(event.indexOf(',') + 1);
			
			var team2 = event.substring(event.indexOf('"') + 1, event.indexOf('",'));

			event = team1 + ' vs ' + team2;
			return event;
		}
	}

	var mKooora = {
		updateCalendar: function(json) {
			
			var d = new Date();
	        var title = json.event;
	        var location = json.notes;
			var notes = json.notes;
			var startDate = json.timestamp;
			var endDate = new Date(startDate.getTime() + 105*60000);
			
			var success = function(message) { };
			var error = function(message) { alert(" createEvent Error: " + message); };
	        
	        console.log(title + location + notes + startDate + endDate);
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
		getMatches: function (url) {
			
			http({
				method: 'GET', 
				url: url})
			.success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available

				data = data.substring(data.indexOf("match_box"));
				data = data.substring(0, data.indexOf("var video_list"));
				var lines=data.split("\n");
				var inputLine;
		        
	        	var jsonObject = {};
		        var jsonArray = [];
		        var note;


		        console.log(data);
		        
		        for(var i=1; i + 2 < lines.length ; i++) {
					//alert(lines[i]);
					jsonObject = {};
					inputLine = lines[i];

					console.log(inputLine);
					
					
					var time = 	inputLine.substring(inputLine.indexOf('#') + 1, inputLine.indexOf('",'));
					
					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					
					var lege = inputLine.substring(inputLine.indexOf('"') + 1, inputLine.indexOf('",'));

					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);

					var team1 = inputLine.substring(inputLine.indexOf('"') + 1, inputLine.indexOf('",'));

					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					inputLine = inputLine.substring(inputLine.indexOf(',') + 1);
					
					var team2 = inputLine.substring(inputLine.indexOf('"') + 1, inputLine.indexOf('",'));

					console.log(team1 + " vs. " + team2);
					console.log(lege);
					console.log(new Date(time*1000));

					jsonObject['event'] = team1 + " vs. " + team2;
					jsonObject['notes'] = lege;
					jsonObject['timestamp'] = new Date(time*1000);

					if (new Date() <= new Date(time*1000)) {
						jsonArray.push(jsonObject);
						mKooora.updateCalendar(jsonObject);
					};
					
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
		}
	}
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
		        
	        	var jsonObject = {};
		        var jsonArray = [];
		        var note;

		        console.log(data);
		        
		        for(var i=0; i<lines.length; i++) {
					//alert(lines[i]);
					inputLine = lines[i];

					if (inputLine.indexOf("lg(") > -1 ) {
						note = kooora.getNote(inputLine);
					}
					if (inputLine.indexOf("mc(") > -1 ) {
						jsonObject = {};
												
						jsonObject['timestamp'] = kooora.getTimestamp(inputLine);
						jsonObject['Chanal'] = note;
						jsonObject['event'] = kooora.getEvent(inputLine);
						jsonObject['notes'] = note;
						jsonArray.push(jsonObject);
						self.updateCalendar(jsonObject);
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
			var d = new Date();
	        var title = json.event;
	        var location = json.notes;
			var notes = json.notes;
			var startDate = new Date();
			startDate.setHours(json.timestamp.substring(0, json.timestamp.indexOf(":")) + 3);
			startDate.setMinutes(json.timestamp.substring(json.timestamp.indexOf(":")+1));
			var endDate = new Date(startDate.getTime() + 105*60000);
			
			var success = function(message) { };
			var error = function(message) { alert(" createEvent Error: " + message); };
	        
	        console.log(title + location + notes + startDate + endDate);
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
		}
	};

	scope.model = model;
	scope.events = {
		getMatches: function () {
			//self.getMatches('http://www.en.beinsports.net/tv-guide');
			mKooora.getMatches('http://m.kooora.com');
			//self.getMatches('http://www.goalzz.com/?region=-1&area=0');
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