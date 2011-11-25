var view = require('../lib/rest/view');

exports.tokenize = function (test) {
	var token = view.tokenize('application/json;q=0.8;charset=utf-8');
	test.equal('application', token.type);
	test.equal('json', token.subtype);
	test.equal(0.8, token.params.q);
	test.equal('utf-8', token.params.charset);
	
	token = view.tokenize('*/*');
	test.equal(0, token.precedence);
	
	test.done();
};

exports.negotiate = function(test)
{
	var header = 'application/*;q=0.8,text/html;q=0.9',
		types = ['application/json', 'text/html'];
	test.equal('text/html', view.negotiate(header, types).renders);
	
	header = 'application/*;q=0.9,text/html;q=0.8';
	test.equal('application/json', view.negotiate(header, types).renders, 'Quality');
	
	header = 'application/json;q=1;level=2, text/html;q=1';
	test.equal('application/json', view.negotiate(header, types).renders, 'Precedence');
	
	test.done();
}
