(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.canFeathers = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(app) {
  var events = ['create', 'update', 'remove'];
  var Model = can.Model;

  return Model.extend({
    setup: function () {
      Model.setup.apply(this, arguments);

      this._locks = {};

      // Resource is required.
      if (!this.resource) {
        return;
      }

      this.client = app.service(this.resource);

      for (var n = 0; n < events.length; n++) {
        this.client.on(events[n] + 'd', this.makeHandler(events[n]));
      }

      this.create = function (attrs, params) {
        return this.send('create', null, attrs, params || {});
      };

      this.update = function (id, attrs, params) {
        return this.send('update', id, attrs, params || {});
      };

      this.destroy = function (id, attrs, params) {
        return this.send('remove', id, params || {});
      };
    },

    // Processes request for create, update, and destroy
    send: function () {
      var self = this;
      var deferred = can.Deferred();
      var args = can.makeArray(arguments);
      var name = args.shift();

      // Name doesn't use id.
      if (name === 'create') {
        args.splice(0, 1);
      }

      // Add the success callback which just resolves or fails the Deferred
      args.push(function (error, data) {
        if (error) {
          return deferred.reject(error);
        }
        self._locks[data[self.id]] = name + 'd';
        deferred.resolve(data);
      });

      // Send the request.
      this.client[name].apply(this.client, args);

      return deferred;
    },

    // A utility function used by this.makeFindAll() and this.makeFindOne()
    makeFind:function(name){
      var self = this;
      return function(params, success, error){
        // A can.Deferred to send back.
        var def = can.Deferred();

        // Add params to args.
        var args = [params || {}];
        // The method to be used for converting to models.
        var method = 'models';
        // Add the id for get requests, change method.
        if (name === 'get') {
          args.unshift(params.id);
          method = 'model';
        }
        // Add the callback to args.
        args[1] = function(err, data){
          if (err) {
            return def.reject(err);
          }
          // Resolve with converted model data.
          def.resolve(self[method](data));
        };
        // Hook up success and error handlers
        def.then(success, error);

        // When the internal client is in place, send the request.
        this.client[name].apply(self.client, args);

        return def;
      };
    },

    // Uses this.makeFind() to create the Model's findAll().
    makeFindAll: function(){
      return this.makeFind('find');
    },

    // Uses this.makeFind() to create the Model's findOne().
    makeFindOne: function(){
      return this.makeFind('get');
    },

    // Creates a resource event handler function for a given event
    makeHandler: function(ev) {
      var self = this;
      return function(data) {
        var id = data[self.id];

        // Check if this id is locked and contains e.g. a 'created'
        // Which means that we are getting the duplicate event from the
        // Socket remove the lock but don't dispatch the event
        if(self._locks[id] === ev + 'd') {
          delete self._locks[id];

          // If we are currently updating or removing we ignore all
          // other resource events for this model instance
        } else if(self._locks[id] !== ev) {

          // Mapping from CanJS to Feathers event name
          var modelEvent = ev === 'remove' ? 'destroyed' : ev + 'd';

          // Only trigger 'create' if the model isn't in the store already.
          if (!(ev === 'create' && self.store[id])) {

            // Trigger the event from the resource as a model event
            var model = self.model(data);
            if(model[modelEvent]) {
              model[modelEvent]();
            }
          }
        }
      };
    }
  }, {});
};

},{}]},{},[1])(1)
});