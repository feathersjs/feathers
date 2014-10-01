'use strict';

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    release: {},

    less: {
      production: {
        options: {
          paths: ["_less"],
          yuicompress: true
        },
        files: {
          "css/feathers.min.css": "_less/main.less"
        }
      }
    },

    watch: {
      less: {
        files: ['_less/**/*.less'],
        tasks: ['less'],
        options: {
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['less']);
};
