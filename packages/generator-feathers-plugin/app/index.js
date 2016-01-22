'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var _ = require('lodash');

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: process.cwd().split(path.sep).pop()
    };
    this.fileMap = {
      'package.json': 'package.json',
      'index.js': 'src/index.js',
      'index.test.js': 'test/index.test.js',
      'README.md': 'README.md',
      'LICENSE': 'LICENSE',
      '__gitignore': '.gitignore',
      '__npmignore': '.npmignore'
    };
  },

  prompting: function () {
    var done = this.async();
    var prompts = [{
      name: 'name',
      message: 'Project name',
      when: !this.pkg.name,
      default: this.props.name
    }, {
      name: 'repository',
      message: 'The GitHub repository URL (e.g. feathersjs/feathers-myplugin)',
      default: 'feathersjs/' + this.props.name
    }, {
      name: 'description',
      message: 'Description',
      when: !this.pkg.description
    }];

    this.prompt(prompts, function (props) {
      this.props = _.extend(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    this.fs.copy(this.templatePath('static/.*'), this.destinationPath());

    Object.keys(this.fileMap).forEach(function(src) {
      var target = this.fileMap[src];

      this.fs.copyTpl(
        this.templatePath(src),
        this.destinationPath(target),
        this.props
      );
    }.bind(this));

    this.npmInstall([
      'debug@^2.2.0'
    ], { save: true });

    this.npmInstall([
      'babel-core@^6.0.0',
      'babel-cli@^6.0.0',
      'babel-preset-es2015@^6.0.0',
      'babel-plugin-add-module-exports',
      'jshint@^2.0.0',
      'mocha@^2.0.0',
      'feathers@^2.0.0-pre.2'
    ], { saveDev: true});
  }
});
