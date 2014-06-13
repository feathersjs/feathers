var feathers = require('feathers');
var app = feathers();

var userService = {
  find: function(params, callback) {
    callback(new this.app.errors.NotFound('User does not exist'));

    // You can also simply do something like this if you
    // just want to fire back a 500 error.
    // 
    // callback('A generic server error');
  },

  setup: function(app){
    this.app = app;
  }
};

app.use('/users', userService)
   .configure(feathers.errors());

app.listen(8080);

console.log('App listening on 127.0.0.1:8080');

