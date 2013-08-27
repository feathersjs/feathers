'use strict';

var exec = require('child_process').exec;

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		release: {},
		jshint: {
			options: {
				node: true
			},
			lib: ['lib/**/*.js', 'Gruntfile.js'],
			test: {
				src: 'test/**/*.js',
				options: {
					globals: {
						it: true,
						describe: true,
						before: true,
						after: true
					}
				}
			}
		},
		simplemocha: {
			options: {
				reporter: 'spec'
			},
			mixins: { src: ['test/mixins/**/*.test.js'] },
			providers: { src: ['test/providers/**/*.test.js'] }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-release');
	grunt.loadNpmTasks('grunt-simple-mocha');

	grunt.registerTask('default', ['jshint', 'simplemocha']);
};