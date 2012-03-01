var rest = require('../lib/rest.js'), mongooseService = require('../lib/resource/mongoose'),
	mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/testing');
var Schema = new mongoose.Schema({
	firstName : String,
	lastName : String
});

rest.createServer().resource('hello', mongooseService.resource('test', Schema))
	.use(rest.defaultRenderer()).listen(8080);