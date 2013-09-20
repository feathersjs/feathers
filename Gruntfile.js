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
    jsbeautifier: {
      options: {
        js: {
          indent_size: 2,
          jslintHappy: true,
          keepArrayIndentation: true,
          wrapLineLength: 0
        }
      },
      files: ['lib/**/*.js', 'test/**/*.js', 'Gruntfile.js', 'package.json']
    },
    simplemocha: {
      application: {
        src: ['test/application.test.js']
      },
      mixins: {
        src: ['test/mixins/**/*.test.js']
      },
      providers: {
        src: ['test/providers/**/*.test.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('test', 'simplemocha');
  grunt.registerTask('beautify', 'jsbeautifier');
  grunt.registerTask('default', ['jshint', 'simplemocha']);
};
