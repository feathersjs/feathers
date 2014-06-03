'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    release: {},
    watch: {
        scripts: {
            files: ['.jshintrc', 'lib/**/*.js', 'Gruntfile.js', 'test/**/*.js'],
            tasks: ['jshint','simplemocha'],
            options: {
                spawn: true
            }
        }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      lib: ['lib/**/*.js', 'Gruntfile.js'],
      test: 'test/**/*.js',
      examples: 'examples/**/*.js'
    },
    simplemocha: {
      all: {
        options: {
            reporter: 'spec',
            clearRequireCache: true
        },
        src: ['test/**/*.test.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'simplemocha']);
  grunt.registerTask('default', ['jshint', 'simplemocha', 'watch']);
};
