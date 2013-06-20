var exec = require('child_process').exec;

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },

    /* Testing
    =======================================================*/
    simplemocha: {
      options: {
        globals: ['should', 'expect'],
        timeout: 3000,
        ignoreLeaks: false,
        // grep: '*-test',
        ui: 'bdd',
        reporter: 'spec'
      },

      all: { src: 'test/**/*.js' },
      mixins: { src: 'test/mixins/**/*.js' },
      providers: { src: 'test/providers/**/*.js' },
      services: { src: 'test/services/**/*.js' }
    },

    /* Documentation
    =======================================================*/
    dox: {
      options: {
        title: "<%= pkg.title || pkg.name %>"
      },
      files: {
        src: ['lib/'],
        dest: 'docs'
      }
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-dox');

  // Alias'
  // --------------------------------------------------
  grunt.registerTask('test', ['simplemocha:all']);
  grunt.registerTask('test:mixins', ['simplemocha:mixins']);
  grunt.registerTask('test:providers', ['simplemocha:providers']);
  grunt.registerTask('test:services', ['simplemocha:services']);

  // Default Task.
  grunt.registerTask("default", ['development']);

  // Development Tasks
  // --------------------------------------------------
  grunt.registerTask('development', ['test']);

  // Release Tasks
  // --------------------------------------------------
};