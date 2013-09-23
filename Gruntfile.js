'use strict';

var pygmentize = require('pygmentize-bundled');

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

    render: {
      index: {
        options: {
          markdown: 'https://raw.github.com/feathersjs/feathers/master/documentation.md',
          template: 'index.handlebars',
          output: 'index.html',
          marked: {
            highlight: function (code, lang, callback) {
              pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
                if (err) return callback(err);
                callback(null, result.toString());
              });
            },
          }
        }
      }
    },

    watch: {
      all: {
        files: ['js/**/*.js', 'less/**/*.less', 'index.handlebars'],
        tasks: ['default'],
        options: {
        },
      },
    },
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['less', 'render']);
};
