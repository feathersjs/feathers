'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var assign = require('object.assign').getPolyfill();

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: process.cwd().split(path.sep).pop(),
      description: this.pkg.description
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

    this.prompt(prompts).then(function (props) {
      this.props = assign(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    this.fs.copy(this.templatePath('static/.*'), this.destinationPath());
    this.fs.copy(this.templatePath('static/**/*'), this.destinationPath());
    this.fs.copy(this.templatePath('static/.github/**/*'), this.destinationPath('.github/'));

    Object.keys(this.fileMap).forEach(function (src) {
      var target = this.fileMap[src];

      this.fs.copyTpl(
        this.templatePath(src),
        this.destinationPath(target),
        this.props
      );
    }.bind(this));

    this.npmInstall(['debug', 'feathers-errors'], {
      save: true
    });

    this.npmInstall([
      'babel-core@^6.17.0',
      'babel-cli@^6.16.0',
      'babel-preset-es2015@^6.0.0',
      'babel-plugin-add-module-exports',
      'semistandard',
      'mocha',
      'istanbul@1.1.0-alpha.1',
      'chai@^3.5.0',
      'shx@^0.2.1'
    ], {
      saveDev: true
    });
  }
});
