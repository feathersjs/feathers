var request = require('request');
var marked = require('marked');
var fs = require('fs');
var Handlebars = require('handlebars');

module.exports = function(grunt) {
	grunt.registerMultiTask('render', 'Render a Handlebars template into a file', function() {
	  var done = this.async();
	  console.log(this.options())

	  // Set default options except highlight which has no default
	  marked.setOptions({
	    // highlight: function (code, lang, callback) {
	    //   pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
	    //     if (err) return callback(err);
	    //     callback(null, result.toString());
	    //   });
	    // }
	  });

	  request('https://raw.github.com/feathersjs/feathers/master/readme.md', function(error, response, body) {
	    if(error || response.statusCode !== 200) {
	      return done(new Error('Could not request readme.md from GitHub'));
	    }

	    marked(body, {}, function(error, content) {
	      fs.readFile('index.handlebars', function(err, tpl) {
	        var renderer = Handlebars.compile(tpl.toString());
	        var output = renderer({
	        	readme: content
	        });

	        fs.writeFile('index.html', output, function(error) {
	        	done(error);
	        });
	      });
	    });
	  });
	});
}