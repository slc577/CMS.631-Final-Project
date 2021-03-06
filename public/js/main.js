$(document).ready(function() {

var MyModel = function() {
	var me = this;
	me.STATES = {
		HOME: 0,
		CHOOSE_ACTIVITIES: 1,
		INSTRUCTIONS: 2, 
		FIRST_QUESTIONS: 3,
		TRANSITION_SCREEN: 4,
		SECOND_QUESTIONS: 5,
		RESULTS: 6, 
		RESULTS2: 7,
		RESULTS3: 8,
		RESULTS4: 9,
		RESULTS5: 10,
		RESULTS6: 11,
		RESULTS7: 12
	};
	me.NUM_ACTIVITIES_TO_PICK = 3;
	me.DESTINATIONS = ko.observableArray(DESTINATIONS);
	me.state = ko.observable(me.STATES.HOME);
	me.pickedActivities = ko.observableArray([]);
	me.firstResults = ko.observableArray([]);
	me.secondResults = ko.observableArray([]);
	me.questionIndex = ko.observable(0);
	me.showBikeSuggest = ko.observable(false);
	me.showPublicSuggest = ko.observable(false);
	me.showCarSuggest = ko.observable(false);


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
				me.firstResults().forEach(function(r) {
					ga("send", {
						hitType: "event", 
						eventCategory: "first-result",
						eventAction: r.name,
					})
				});
				me.secondResults().forEach(function(r) {
					ga("send", {
						hitType: "event", 
						eventCategory: "second-result",
						eventAction: r.name,
					})
				});
			}
		}
	}

	me.totalFirst = ko.pureComputed({
		read: function() {
			var carbon = 0;
			var time = 0;
			var money = 0;
			me.firstResults().forEach(function(r) {
				carbon += parseFloat(r.details.carbon);
				time += parseInt(r.details.time);
				money += parseFloat(r.details.money);
			});

			return {carbon: carbon.toFixed(2), time: time, money: money.toFixed(2)};
		}
	});

	me.totalSecond = ko.pureComputed({
		read: function() {
			var carbon = 0;
			var time = 0;
			var money = 0;
			me.secondResults().forEach(function(r) {
				carbon += parseFloat(r.details.carbon);
				time += parseInt(r.details.time);
				money += parseFloat(r.details.money);
			});
			return {carbon: carbon.toFixed(2), time: time, money: money.toFixed(2)};
		}
	});

	me.showDiff = ko.pureComputed({
		read: function() {
			if (me.totalSecond().carbon < me.totalFirst().carbon) {
				return 1;
			} else if (me.totalSecond().carbon > me.totalFirst().carbon) {
				return -1;
			} else {
				return 0;
			}
		}
	});

	me.carbon1 = ko.pureComputed({
		read: function() {
			if (me.showDiff() == 0) {
				return me.totalFirst().carbon;
			}
			return Math.abs(me.totalFirst().carbon - me.totalSecond().carbon).toFixed(2);
		}		
	})

	me.carbon1000 = ko.pureComputed({
		read: function() {
			return (me.carbon1()*1000).toFixed(0);
		}
	});

	me.trees1 = ko.pureComputed({
		read: function() {
			return (me.carbon1()/0.13).toFixed(2);
		}
	});

	me.reset = function() {
		me.pickedActivities([]);
		me.firstResults([]);
		me.secondResults([]);
		me.questionIndex(0);
		me.state(me.STATES.HOME);
	}
} // end of ko model

ko.applyBindings(new MyModel());
}); //end of document.ready