'use strict';

const Generator = require('yeoman-generator');
const path = require('path');

module.exports = class FeathersPluginGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: process.cwd().split(path.sep).pop(),
      description: this.pkg.description
    };
    this.fileMap = {
      'package.json': 'package.json',
      'index.js': 'lib/index.js',
      'index.test.js': 'test/index.test.js',
      'README.md': 'README.md',
      'LICENSE': 'LICENSE',
      '__gitignore': '.gitignore',
      '__npmignore': '.npmignore'
    };
  }

  prompting () {
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
      this.props = Object.assign(this.props, props);

      done();
    }.bind(this));
  }

  writing () {
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

    this.npmInstall(['debug'], {
      save: true
    });

    this.npmInstall([
      'semistandard',
      'mocha',
      'istanbul@1.1.0-alpha.1',
      'chai@^3.5.0'
    ], {
      saveDev: true
    });
  }
};
