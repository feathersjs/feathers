'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    release: {

    },

    less: {
      production: {
        options: {
          paths: ["less"],
          yuicompress: true
          // ieCompat: true
        },
        files: {
          "css/feathers.min.css": "less/main.less"
        }
      }
    },

    watch: {
      all: {
        files: ['js/**/*.js', 'less/**/*.less'],
        tasks: ['default'],
        options: {
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['less']);
};
