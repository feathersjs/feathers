 // app.js
  var feathers = require('feathers');
  var rest = require('feathers-rest');
  var socketio = require('feathers-socketio');
  var memory = require('feathers-memory');
  var bodyParser = require('body-parser');

  // A Feathers app is the same as an Express app
  var app = feathers();

  // Add REST API support
  app.configure(feathers.rest());
  // Configure Socket.io real-time APIs
  app.configure(feathers.socketio());
  // Parse HTTP JSON bodies
  app.use(bodyParser.json());
  // Register our memory "messages" service
  app.use('/messages', memory());
  // Start the server
  app.listen(3000);