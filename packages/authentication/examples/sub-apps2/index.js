var feathers = require('feathers');
var apiV1 = require('./api/v1');
var apiV2 = require('./api/v2');

// Initialize the application
var app = feathers()
  // Initialize our API sub app
  .use('/api', apiV1)
  .use('/api', apiV2)
  .use('/', feathers.static(__dirname + '/public'));

app.listen(3030);

console.log('Feathers authentication app started on 127.0.0.1:3030');
