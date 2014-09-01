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
          paths: ["_less"],
          yuicompress: true
        },
        files: {
          "css/feathers.min.css": "_less/main.less"
        }
      }
    },

    watch: {
      all: {
        files: ['less/**/*.less', 'index.handlebars'],
        tasks: ['default'],
        options: {
        }
      }
    }
  });

  grunt.loadTasks('build/tasks');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['less']);
};
