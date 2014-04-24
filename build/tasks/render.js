var request = require('request');
var marked = require('marked');
var fs = require('fs');
var Handlebars = require('handlebars');

module.exports = function(grunt) {
	grunt.registerMultiTask('render', 'Render a Handlebars template into a file', function() {
	  var done = this.async();
	  var options = this.options();

	  request(options.markdown, function(error, response, body) {
	    if(error || response.statusCode !== 200) {
	      return done(new Error('Could not request readme.md from GitHub'));
	    }

	    marked(body, options.marked || {}, function(error, content) {
	      fs.readFile(options.template, function(err, tpl) {
	        var renderer = Handlebars.compile(tpl.toString());
	        var output = renderer(content);

	        fs.writeFile(options.output, output, function(error) {
	        	done(error);
	        });
	      });
	    });
	  });
	});
}