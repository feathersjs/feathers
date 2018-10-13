const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const j = require('@feathersjs/tools').transform;
const validate = require('validate-npm-package-name');
const Generator = require('../../lib/generator');

const templatePath = path.join(__dirname, 'templates');
const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');

module.exports = class ServiceGenerator extends Generator {
  prompting() {
    this.checkPackage();

    const { props } = this;
    const prompts = [
      {
        type: 'list',
        name: 'adapter',
        message: 'What kind of service is it?',
        default: 'nedb',
        choices: [
          {
            name: 'A custom service',
            value: 'generic'
          }, {
            name: 'In Memory',
            value: 'memory'
          }, {
            name: 'NeDB',
            value: 'nedb'
          }, {
            name: 'MongoDB',
            value: 'mongodb'
          }, {
            name: 'Mongoose',
            value: 'mongoose'
          }, {
            name: 'Sequelize',
            value: 'sequelize'
          }, {
            name: 'KnexJS',
            value: 'knex'
          }, {
            name: 'RethinkDB',
            value: 'rethinkdb'
          }, {
            name: 'Objection',
            value: 'objection'
          }, {
            name: 'Cassandra',
            value: 'cassandra'
          }
        ]
      }, {
        name: 'name',
        message: 'What is the name of the service?',
        validate(input) {
          if(input.trim() === '') {
            return 'Service name can not be empty';
          }

          if(input.trim() === 'authentication') {
            return '`authentication` is a reserved service name.';
          }

          return true;
        },
        when: !props.name
      }, {
        name: 'path',
        message: 'Which path should the service be registered on?',
        when: !props.path,
        default(answers) {
          const parts = (answers.name || props.name).split('/');
          const name = _.kebabCase(parts.pop());

          return `/${parts.concat(name).join('/')}`;
        },
        validate(input) {
          if(input.trim() === '') {
            return 'Service path can not be empty';
          }

          return true;
        }
      }, {
        name: 'requiresAuth',
        message: 'Does the service require authentication?',
        type: 'confirm',
        default: false,
        when: !!(this.defaultConfig.authentication && !props.authentication)
      }
    ];

    return this.prompt(prompts).then(answers => {
      const parts = (answers.name || props.name)
        .split('/')
        // exclude route parameters from folder hierarchy i.e. /users/:id/roles
        .filter(part => !part.startsWith(':'));
      const name = parts.pop();

      this.props = Object.assign({
        requiresAuth: false
      }, props, answers, {
        subfolder: parts,
        snakeName: _.snakeCase(name),
        kebabName: validate(name).validForNewPackages ? name : _.kebabCase(name),
        camelName: _.camelCase(name)
      });
    });
  }

  _transformCode(code) {
    const { kebabName, subfolder } = this.props;
    const ast = j(code);
    const mainExpression = ast.find(j.FunctionExpression).closest(j.ExpressionStatement);
    const folder = subfolder.concat(kebabName).join('/');
    const camelName = _.camelCase(folder);
    const serviceRequire = `const ${camelName} = require('./${folder}/${kebabName}.service.js');`;
    const serviceCode = `app.configure(${camelName});`;

    if(mainExpression.length !== 1) {
      this.log
        .writeln()
        .conflict(`${this.libDirectory}/services/index.js seems to have more than one function declaration and we can not register the new service. Did you modify it?`)
        .info('You will need to add the next lines manually to the file')
        .info(serviceRequire)
        .info(serviceCode)
        .writeln();
    } else {
      // Add require('./service')
      mainExpression.insertBefore(serviceRequire);
      // Add app.configure(service) to service/index.js
      mainExpression.insertLastInFunction(serviceCode);
    }

    return ast.toSource();
  }

  writing() {
    const { adapter, kebabName, subfolder } = this.props;
    const moduleMappings = {
      generic: `./${kebabName}.class.js`,
      memory: 'feathers-memory',
      nedb: 'feathers-nedb',
      mongodb: 'feathers-mongodb',
      mongoose: 'feathers-mongoose',
      sequelize: 'feathers-sequelize',
      knex: 'feathers-knex',
      rethinkdb: 'feathers-rethinkdb',
      objection: 'feathers-objection',
      cassandra: 'feathers-cassandra'
    };
    const serviceModule = moduleMappings[adapter];
    const serviceFolder = [ this.libDirectory, 'services', ...subfolder, kebabName ];
    const mainFile = this.destinationPath(... serviceFolder, `${kebabName}.service.js`);
    const modelTpl = `${adapter}${this.props.authentication ? '-user' : ''}.js`;
    const hasModel = fs.existsSync(path.join(templatePath, 'model', modelTpl));
    const context = Object.assign({}, this.props, {
      libDirectory: this.libDirectory,
      modelName: hasModel ? `${kebabName}.model` : null,
      path: stripSlashes(this.props.path),
      relativeRoot: '../'.repeat(subfolder.length + 2),
      serviceModule
    });
    const tester = this.pkg.config.tester || 'mocha';

    // Do not run code transformations if the service file already exists
    if (!this.fs.exists(mainFile)) {
      const servicejs = this.destinationPath(this.libDirectory, 'services', 'index.js');
      const transformed = this._transformCode(
        this.fs.read(servicejs).toString()
      );

      this.conflicter.force = true;
      this.fs.write(servicejs, transformed);
    }

    // Run the `connection` generator for the selected database
    // It will not do anything if the db has been set up already
    if (adapter !== 'generic' && adapter !== 'memory') {
      this.composeWith(require.resolve('../connection'), {
        props: {
          adapter,
          service: this.props.name
        }
      });
    } else if(adapter === 'generic') {
      // Copy the generic service class
      this.fs.copyTpl(
        this.templatePath(this.hasAsync ? 'class-async.js' : 'class.js'),
        this.destinationPath(... serviceFolder, `${kebabName}.class.js`),
        context
      );
    }

    if (context.modelName) {
      // Copy the model
      this.fs.copyTpl(
        this.templatePath('model', modelTpl),
        this.destinationPath(this.libDirectory, 'models', `${context.modelName}.js`),
        context
      );
    }

    this.fs.copyTpl(
      this.templatePath(`hooks${this.props.authentication ? '-user' : ''}.js`),
      this.destinationPath(... serviceFolder, `${kebabName}.hooks.js`),
      context
    );

    if (fs.existsSync(path.join(templatePath, 'types', `${adapter}.js`))) {
      this.fs.copyTpl(
        this.templatePath('types', `${adapter}.js`),
        mainFile,
        context
      );
    } else {
      this.fs.copyTpl(
        this.templatePath('service.js'),
        mainFile,
        context
      );
    }

    this.fs.copyTpl(
      this.templatePath(`test.${tester}.js`),
      this.destinationPath(this.testDirectory, 'services', ...subfolder, `${kebabName}.test.js`),
      context
    );

    if (serviceModule.charAt(0) !== '.') {
      this._packagerInstall([ serviceModule ], { save: true });
    }
  }
};
