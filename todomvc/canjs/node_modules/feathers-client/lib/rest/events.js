var EventEmitter = require('events').EventEmitter;
var utils = require('../utils');
var makeEmitting = function(name) {
  return function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var callback = args[args.length - 1];
    var _emit = this.emit.bind(this);
    if(typeof callback === 'function') {
      args[args.length - 1] = function(error, data) {
        if(!error) {
          _emit(name, data);
        }
        callback(error, data);
      };
    }
    return this._super.apply(this, args);
  };
};

module.exports = utils.extend({
  create: makeEmitting('created'),
  update: makeEmitting('updated'),
  patch: makeEmitting('patched'),
  remove: makeEmitting('removed')
}, EventEmitter.prototype);
