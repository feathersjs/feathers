exports.stripSlashes = function (name) {
  return name.replace(/^\/|\/$/g, '');
};

exports.extend = function() {
  var first = arguments[0];
  var assign = function(current) {
    Object.keys(current).forEach(function(key) {
      first[key] = current[key];
    });
  };
  var current;

  for(var i = 1; i < arguments.length; i++) {
    current = arguments[i];
    assign(current);
  }
  return first;
};

exports.methods = [ 'find', 'get', 'create', 'update', 'patch', 'remove' ];

exports.events = [ 'created', 'updated', 'patched', 'removed' ];