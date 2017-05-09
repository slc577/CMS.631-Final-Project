$(document).ready(function() {


var MyModel = function() {
	var me = this;
	me.STATES = {
		HOME: 0,
		CHOOSE_ACTIVITIES: 1,
		FIRST_QUESTIONS: 2,
		TRANSITION_SCREEN: 3,
		SECOND_QUESTIONS: 4,
		RESULTS: 5
	};
	me.NUM_ACTIVITIES_TO_PICK = 2;
	me.DESTINATIONS = ko.observableArray(DESTINATIONS);
	me.state = ko.observable(me.STATES.HOME);
	me.pickedActivities = ko.observableArray([]);
	me.firstResults = ko.observableArray([]);
	me.secondResults = ko.observableArray([]);
	me.questionIndex = ko.observable(0);

	me.toggleActivity = function(activity) {
		for (var i = 0; i < me.pickedActivities().length; i++) {
			if (me.pickedActivities()[i].id == activity.id) {
				me.pickedActivities.splice(i, 1); // delete it
				return;
			} 
		}
		me.pickedActivities.push(activity);
	}

	me.isPickedActivity = function(activity) {
		for (var i = 0; i < me.pickedActivities().length; i++) {
			if (me.pickedActivities()[i].id == activity.id) {
				return true;
			} 
		}
		return false;
	}

	me.currentActivity = ko.pureComputed({
		read: function() {
			if (me.pickedActivities().length > me.questionIndex()) {
				return me.pickedActivities()[me.questionIndex()];
			} else {
				return null;
			}
		}
	});

	me.selectTransport = function(name, details) {
		if (me.state() == me.STATES.FIRST_QUESTIONS) {
			var current = me.firstResults();
			if (current.length <= me.questionIndex()) {
				me.firstResults.push({"name": name, "details": details[name]});
			} else {
				current[me.questionIndex()] = {"name": name, "details": details[name]};
				me.firstResults(current);
			}
		} else if (me.state() == me.STATES.SECOND_QUESTIONS) {
			var current = me.secondResults();
			if (current.length <= me.questionIndex()) {
				me.secondResults.push({"name": name, "details": details[name]});
			} else {
				current[me.questionIndex()] = {"name": name, "details": details[name]};
				me.secondResults(current);
			}
		} else {
			return; 
		}
	}

	me.isPickedTransport = function(name) {
		if (me.state() == me.STATES.FIRST_QUESTIONS) {
			var current = me.firstResults();
		} else if (me.state() == me.STATES.SECOND_QUESTIONS) {
			var current = me.secondResults();
		} else {
			return false;
		}
		if (current.length > me.questionIndex()) {
			return name == current[me.questionIndex()].name;
		}
		return false;
	}

	me.next = function() {
		if (me.state() == me.STATES.FIRST_QUESTIONS) {
			me.questionIndex(me.questionIndex()+1);
			if (me.questionIndex() >= me.NUM_ACTIVITIES_TO_PICK) {
				me.questionIndex(0);
				me.state(me.STATES.TRANSITION_SCREEN);
			}
		} else if (me.state() == me.STATES.SECOND_QUESTIONS) {
			me.questionIndex(me.questionIndex()+1);
			if (me.questionIndex() >= me.NUM_ACTIVITIES_TO_PICK) {
				me.questionIndex(0);
				me.state(me.STATES.RESULTS);
			}
		}
	}

	me.totalCarbonFirst = ko.pureComputed({
		read: function() {
			var sum = 0;
			me.firstResults().forEach(function(r) {
				sum += parseFloat(r.details.carbon);
			});
			return sum;
		}
	});

	me.totalCarbonSecond = ko.pureComputed({
		read: function() {
			var sum = 0;
			me.secondResults().forEach(function(r) {
				sum += parseFloat(r.details.carbon);
			});
			return sum;
		}
	});
} // end of ko model

ko.applyBindings(new MyModel());
}); //end of document.ready