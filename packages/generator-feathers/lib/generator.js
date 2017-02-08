'use strict';

const Generator = require('yeoman-generator');

module.exports = class BaseGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    const defaultConfig = this.destinationPath('config', 'default.json');

    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.defaultConfig = this.fs.readJSON(defaultConfig, {});
    this.props = opts.props || {};
  }

  get libDirectory() {
    return this.pkg.directories && this.pkg.directories.lib;
  }

  _packagerInstall(... args) {
    const packager = this.pkg.engines && this.pkg.engines.yarn ? 
      'yarn' : 'npm';
    const method = `${packager}Install`;

    return this[method](... args);
  }
};
