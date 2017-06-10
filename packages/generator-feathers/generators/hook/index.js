const fs = require('fs');
const path = require('path');
const Generator = require('../../lib/generator');
const { kebabCase, camelCase } = require('lodash');
const j = require('../../lib/transform');

module.exports = class HookGenerator extends Generator {
  _listDirectories (...args) {
    const serviceDir = this.destinationPath(...args);
    const files = fs.readdirSync(serviceDir);

    return files.filter(current =>
      fs.lstatSync(path.join(serviceDir, current)).isDirectory()
    );
  }

  _transformHookFile (code, moduleName) {
    const { type, methods, camelName } = this.props;
    const hookRequire = `const ${camelName} = require('${moduleName}');`;

    const ast = j(code);
    const hookDefinitions = ast.find(j.ObjectExpression)
      .closest(j.ExpressionStatement);

    if (hookDefinitions.length !== 1) {
      throw new Error(`Could not find the hooks definition object while adding ${moduleName}`);
    }

    hookDefinitions.insertBefore(hookRequire);

    methods.forEach(method => {
      ast.insertHook(type, method, camelName);
    });

    return ast.toSource();
  }

  _addToService (serviceName, hookName) {
    let hooksFile = this.destinationPath(this.libDirectory, 'services', serviceName, `${serviceName}.hooks.js`);
    let moduleName = `../../${hookName}`;

    if (serviceName === '__app') {
      hooksFile = this.destinationPath(this.libDirectory, 'app.hooks.js');
      moduleName = `./${hookName}`;
    }

    if (!this.fs.exists(hooksFile)) {
      throw new Error(`Can not add hook to the ${serviceName} hooks file ${hooksFile}. It does not exist.`);
    }

    const transformed = this._transformHookFile(this.fs.read(hooksFile), moduleName);

    this.conflicter.force = true;
    this.fs.write(hooksFile, transformed);
  }

  prompting () {
    this.checkPackage();

    const services = this._listDirectories(this.libDirectory, 'services');
    const prompts = [
      {
        name: 'name',
        message: 'What is the name of the hook?'
      }, {
        type: 'list',
        name: 'type',
        message: 'What kind of hook should it be?',
        choices: [
          {
            name: 'I will add it myself',
            value: null
          }, {
            value: 'before'
          }, {
            value: 'after'
          }, {
            value: 'error'
          }
        ]
      }, {
        type: 'checkbox',
        name: 'services',
        message: 'What service(s) should this hook be for (select none to add it yourself)?\n',
        choices () {
          return [{
            name: 'Application wide (all services)',
            value: '__app'
          }].concat(services.map(value => ({ value })));
        },
        when (answers) {
          return answers.type !== null;
        }
      }, {
        type: 'checkbox',
        name: 'methods',
        message: 'What methods should the hook be for (select none to add it yourself)?',
        choices: [
          {
            value: 'all'
          }, {
            value: 'find'
          }, {
            value: 'get'
          }, {
            value: 'create'
          }, {
            value: 'update'
          }, {
            value: 'patch'
          }, {
            value: 'remove'
          }
        ],
        when (answers) {
          return answers.type !== null && answers.services.length;
        },
        validate (methods) {
          if (methods.indexOf('all') !== -1 && methods.length !== 1) {
            return 'Select applicable methods or \'all\', not both.';
          }

          return true;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props, {
        kebabName: kebabCase(props.name),
        camelName: camelCase(props.name)
      });
    });
  }

  writing () {
    const context = Object.assign({
      libDirectory: this.libDirectory
    }, this.props);
    const mainFile = this.destinationPath(this.libDirectory, 'hooks', `${context.kebabName}.js`);

    if (!this.fs.exists(mainFile) && context.type) {
      this.props.services.forEach(serviceName =>
        this._addToService(serviceName, `hooks/${context.kebabName}`)
      );
    }

    this.fs.copyTpl(
      this.templatePath('hook.js'),
      mainFile, context
    );

    this.fs.copyTpl(
      this.templatePath('test.js'),
      this.destinationPath(this.testDirectory, 'hooks', `${context.kebabName}.test.js`),
      context
    );
  }
};
