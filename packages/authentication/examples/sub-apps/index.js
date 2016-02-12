var feathers = require('feathers');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var hooks = require('feathers-hooks');
var bodyParser = require('body-parser');
var api = require('./api');

// Initialize the application
var app = feathers()
  .configure(rest())
  .configure(socketio())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  // Initialize our API sub app
  .use('/api', api)
  .use('/', feathers.static(__dirname + '/public'));

app.listen(3030);

console.log('Feathers authentication app started on 127.0.0.1:3030');
