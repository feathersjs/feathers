'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        release: {},
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            lib: ['lib/**/*.js', 'Gruntfile.js'],
            test: 'test/**/*.js'
        },
        simplemocha: {
            all: {
                src: ['test/**/*.test.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-simple-mocha');

    grunt.registerTask('test', 'simplemocha');
    grunt.registerTask('default', ['jshint', 'simplemocha']);
};