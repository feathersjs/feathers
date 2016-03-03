var notify = require("gulp-notify");

module.exports = function() {

  var args = Array.prototype.slice.call(arguments);

  if (typeof args[0] === 'string') {
    args[0] = new Error(args[0]);
  }

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error.message %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};