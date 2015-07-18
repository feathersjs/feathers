/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#list/promise/promise*/
steal("can/list", function (list) {

	var oldReplace = can.List.prototype.replace;

	can.List.prototype.replace = function (data) {
		// First call the old replace so its
		// deferred callbacks will be called first
		var result = oldReplace.apply(this, arguments);

		// If there is a deferred:
		if (can.isDeferred(data)) {
			// Set up its state.  Must call this way
			// because we are working on an array.
			can.batch.start();
			this.attr("state", data.state());
			this.removeAttr("reason");
			can.batch.stop();
			
			var self = this;
			// update its state when it changes
			var deferred = this._deferred = new can.Deferred();
			
			data.then(function(){
				self.attr("state", data.state());
				// The deferred methods will always return this object
				deferred.resolve(self);
			},function(reason){
				can.batch.start();
				self.attr("state", data.state());
				self.attr("reason", reason);
				can.batch.stop();
				deferred.reject(reason);
			});
		}
		return result;
	};
	
	can.each({
		isResolved: "resolved",
		isPending: "pending",
		isRejected: "rejected"
	}, function (value, method) {
		can.List.prototype[method] = function () {
			return this.attr("state") === value;
		};
	});


	can.each([
		"then",
		"done",
		"fail",
		"always",
		"promise"
	], function (name) {
		can.List.prototype[name] = function () {
			// it's possible a list is created manually and returned as the result
			// of .then.  It should not break.
			if(!this._deferred) {
				this._deferred = new can.Deferred();
				this._deferred.resolve(this);
			}
			
			return this._deferred[name].apply(this._deferred, arguments);
		};
	});
});

