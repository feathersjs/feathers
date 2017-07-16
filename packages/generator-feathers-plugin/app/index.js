'use strict';

const Generator = require('yeoman-generator');
const path = require('path');
const pkgForClient = require('./templates/client/package.json.js');

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
    const prompts = [{
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
    }, {
      type: 'confirm',
      name: 'client',
      default: false,
      message: 'Does this plugin require a client side build?'
    }];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writing () {
    const devDependencies = [
      'semistandard',
      'mocha',
      'istanbul@1.1.0-alpha.1',
      'chai@^3.5.0'
    ];

    if (this.props.client) {
      devDependencies.push('babel-core',
        'babel-preset-es2015',
        'babelify',
        'browserify',
        'shx',
        'uglify-js'
      );
    }

    this.fs.copy(this.templatePath('static/.*'), this.destinationPath());
    this.fs.copy(this.templatePath('static/**/*'), this.destinationPath());
    this.fs.copy(this.templatePath('static/.github/**/*'), this.destinationPath('.github/'));

    Object.keys(this.fileMap).forEach(function (src) {
      const target = this.fileMap[src];

      this.fs.copyTpl(
        this.templatePath(src),
        this.destinationPath(target),
        this.props
      );
    }.bind(this));

    if (this.props.client) {
      const pkgFile = this.destinationPath('package.json');
      const pkg = this.fs.readJSON(pkgFile);

      this.fs.writeJSON(pkgFile, pkgForClient(pkg));
      this.fs.copy(this.templatePath('client/_babelrc'), this.destinationPath('.babelrc'));
    }

    this.npmInstall(devDependencies, {
      saveDev: true
    });
  }
};
