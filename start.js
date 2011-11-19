var connect = require('connect');

var server = connect.createServer(
	function(req, res, next) {
		var parts = req.url.split('/'), result = parts[0] || 'index';
		console.log(parts);
		res.end(result);
	}
).listen(8080);
