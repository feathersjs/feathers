const Generator = require('yeoman-generator');
const semver = require('semver');
const _ = require('lodash');

module.exports = class BaseGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    const defaultConfig = this.destinationPath('config', 'default.json');

    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.defaultConfig = this.fs.readJSON(defaultConfig, {});
    this.props = opts.props || {};

    if(process.version < 'v6.0.0') {
      this.log.error('The generator is only tested to work with Node v6.0.0 and up!');
    }
  }

  checkPackage() {
    if(_.isEmpty(this.pkg)) {
      this.log.error('Could not find a valid package.json. Did you generate a new application and are running the generator in the project directory?');
      return process.exit(1);
    }

    if(!(this.pkg.directories && this.pkg.directories.lib)) {
      this.log.error('It does not look like this application has been generated with this version of the generator or the required `directories.lib` has been removed from package.json.');
      return process.exit(1);
    }
  }

  get hasAsync() {
    const asyncNode = '>= 8.0.0';
    const pkgEngineAsync = !(this.pkg.engines && this.pkg.engines.node) ||
      semver.intersects(this.pkg.engines.node, asyncNode);

    return semver.satisfies(process.version, asyncNode) && pkgEngineAsync;
  }

  get libDirectory() {
    return this.pkg.directories && this.pkg.directories.lib;
  }

  get testDirectory() {
    return (this.pkg.directories && this.pkg.directories.test) || 'test';
  }

  _packagerInstall(deps, options) {
    const packager = this.pkg.engines && this.pkg.engines.yarn ? 
      'yarn' : 'npm';
    const method = `${packager}Install`;
    const isDev = options.saveDev;
    const existingDependencies = this.pkg[isDev ? 'devDependencies' : 'dependencies'] || {};
    const dependencies = deps.filter(current => !existingDependencies[current]);

    if(packager === 'yarn' && isDev) {
      options.dev = true;
      delete options.saveDev;
    }

    return this[method](dependencies, options);
  }
};
