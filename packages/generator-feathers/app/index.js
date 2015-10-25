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
    this.dotfiles = ['editorconfig', 'gitignore', 'jshintrc', 'npmignore', 'travis.yml'];
    this.files = ['package.json', 'src/index.js', 'test/index.test.js', 'LICENSE', 'README.md'];
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
    this.dotfiles.forEach(function(file) {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath('.' + file),
        this.props
      );
    }.bind(this));

    this.files.forEach(function(file) {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        this.props
      );
    }.bind(this));

    this.npmInstall([
      'babel',
      'jshint',
      'mocha',
      'feathers'
    ], { saveDev: true});
  }
});
