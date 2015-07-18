/*global module:false*/
module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: [ 'lib/es5.js', 'lib/proto.js'],
				dest: 'dist/proto.js'
			},
			es5: {
				src: ['lib/proto.js'],
				dest: 'dist/proto.es5.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: 'dist/proto.min.js'
			},
			legacy: {
				src: '<%= concat.dist.dest %>',
				dest: 'proto.min.js'
			},
			es5: {
				src: '<%= concat.es5.dest %>',
				dest: 'dist/proto.es5.min.js'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			lib: {
				src: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
			}
		},
		simplemocha: {
			lib: ['test/**/*.js']
		},
		release: {}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-release');

	// Default task.
	grunt.registerTask('test', ['jshint', 'simplemocha']);
	grunt.registerTask('default', ['test', 'concat', 'uglify']);

};
