var feathers = require('../../lib/feathers');

feathers()
	.configure(feathers.socketio)
	.use(feathers.static(__dirname))
	.use('todos', feathers.service.memory())
	.listen(3000);
