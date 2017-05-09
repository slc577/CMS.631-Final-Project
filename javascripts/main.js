$(document).ready(function() {

var MyModel = function() {
	var me = this;
	me.title = ko.observable("Hello World!");
} // end of ko model

ko.applyBindings(new MyModel());
}); //end of document.ready