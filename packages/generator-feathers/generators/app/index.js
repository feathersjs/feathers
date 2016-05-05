'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var crypto = require('crypto');
var updateMixin = require('../../lib/updateMixin');
var S = require('string');
var AUTH_PROVIDERS = require('./auth-mapping.json');
var assign = require('object.assign').getPolyfill();

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    updateMixin.extend(this);
  },

  initializing: function () {
    var done = this.async();
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop(),
      description: this.pkg.description,
      S: S
    };

    this.dependencies = [
      'feathers@^2.0.0',
      'feathers-hooks@^1.5.0',
      'feathers-errors@^2.0.1',
      'feathers-configuration@^0.2.1',
      'serve-favicon',
      'compression',
      'winston'
    ];
    this.mixins.notifyUpdate(done);
  },

  prompting: function () {
    var done = this.async();
    var prompts = [
      {
        name: 'name',
        message: 'Project name',
        when: !this.pkg.name,
        default: this.props.name
      },
      {
        name: 'description',
        message: 'Description',
        when: !this.pkg.description
      },
      {
        type: 'checkbox',
        name: 'providers',
        message: 'What type of API are you making?',
        choices: [
          {
            name: 'REST',
            value: 'rest',
            checked: true
          },
          {
            name: 'Realtime via Socket.io',
            value: 'socket.io',
            checked: true
          },
          {
            name: 'Realtime via Primus',
            value: 'primus',
          }
        ]
      },
      {
        type: 'list',
        name: 'cors',
        message: 'CORS configuration',
        choices: [
          {
            name: 'Enabled for all domains',
            value: 'enabled',
            checked: true
          },
          {
            name: 'Enabled for whitelisted domains',
            value: 'whitelisted'
          },
          {
            name: 'Disabled',
            value: false
          }
        ]
      },
      {
        type: 'input',
        name: 'corsWhitelist',
        message: 'Comma-separated domains for CORS whitelist. Include http(s)',
        when: function(props){
          return props.cors === 'whitelisted';
        }
      },
      {
        type: 'list',
        name: 'database',
        message: 'What database do you primarily want to use?',
        default: 'nedb',
        choices: [
          {
            name: 'Memory',
            value: 'memory'
          },
          {
            name: 'MongoDB',
            value: 'mongodb'
          },
          {
            name: 'MySQL',
            value: 'mysql'
          },
          {
            name: 'MariaDB',
            value: 'mariadb'
          },
          {
            name: 'NeDB',
            value: 'nedb'
          },
          {
            name: 'PostgreSQL',
            value: 'postgres'
          },
          {
            name: 'SQLite',
            value: 'sqlite'
          },
          {
           name: 'SQL Server',
           value: 'mssql'
          },
          {
            name: 'I will choose my own',
            value: 'generic'
          },
        ]
      },
      {
        type: 'checkbox',
        name: 'authentication',
        message: 'What authentication providers would you like to support?',
        choices: [
          {
            name: 'local',
            checked: true,
            value: AUTH_PROVIDERS.local,
          },
          {
            name: 'bitbucket',
            value: AUTH_PROVIDERS.bitbucket,
          },
          {
            name: 'dropbox',
            value: AUTH_PROVIDERS.dropbox,
          },
          {
            name: 'facebook',
            value: AUTH_PROVIDERS.facebook,
          },
          {
            name: 'github',
            value: AUTH_PROVIDERS.github,
          },
          {
            name: 'google',
            value: AUTH_PROVIDERS.google,
          },
          {
            name: 'instagram',
            value: AUTH_PROVIDERS.instagram,
          },
          {
            name: 'linkedin',
            value: AUTH_PROVIDERS.linkedin,
          },
          {
            name: 'paypal',
            value: AUTH_PROVIDERS.paypal,
          },
          {
            name: 'spotify',
            value: AUTH_PROVIDERS.spotify
          }
        ]
      }
    ];

    this.prompt(prompts).then(function (props) {
      this.props = assign(this.props, props);
      this.props.databaseName = S(this.props.name).camelize().s;
      this.props.babel = process.versions.node < '5.0.0';
      done();
    }.bind(this));
  },

  writing: {
    providers: function() {
      if (this.props.providers.indexOf('rest') !== -1) {
        this.dependencies.push('body-parser');
        this.dependencies.push('feathers-rest@^1.0.0');
      }

      if (this.props.providers.indexOf('socket.io') !== -1) {
        this.dependencies.push('feathers-socketio@^1.0.0');
      }

      if (this.props.providers.indexOf('primus') !== -1) {
        this.dependencies.push('feathers-primus@^1.0.0');
        this.dependencies.push('ws');
      }
    },

    cors: function() {
      this.props.corsWhitelist = this.props.corsWhitelist && this.props.corsWhitelist.split(',');

      if (this.props.cors) {
        this.dependencies.push('cors');
      }
    },

    authentication: function() {
      this.props.secret = crypto.randomBytes(64).toString('base64');
      this.props.localAuth = false;

      if (this.props.authentication.length) {
        this.dependencies.push('feathers-authentication@^0.7.0');
        this.dependencies.push('passport');

        this.props.authentication = this.props.authentication.filter(function(provider) {
          if (provider.name === 'local') {
            this.props.localAuth = true;
          }
          else {
            this.dependencies.push(provider.strategy);

            if (provider.tokenStrategy) {
              this.dependencies.push(provider.tokenStrategy);
            }

            return provider;
          }
        }.bind(this));

        this.fs.copyTpl(
          this.templatePath('authentication.js'),
          this.destinationPath('src/services/authentication', 'index.js'),
          this.props
        );
      }
    },

    databases: function() {
      switch(this.props.database) {
        case 'memory':
          this.dependencies.push('feathers-memory@^0.6.0');
          break;
        case 'mongodb':
          this.dependencies.push('mongoose');
          this.dependencies.push('feathers-mongoose@^3.0.0');
          break;
        case 'mysql':
        case 'mariadb':
          this.dependencies.push('mysql');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize@^1.0.0');
          break;
        case 'nedb':
          this.dependencies.push('nedb');
          this.dependencies.push('feathers-nedb@^2.0.0');
          break;
        case 'postgres':
          this.dependencies.push('pg');
          this.dependencies.push('pg-hstore');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize@^1.0.0');
          break;
        case 'sqlite':
          this.dependencies.push('sqlite3');
          this.dependencies.push('fs-extra');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize@^1.0.0');
          break;
        case 'mssql':
          this.dependencies.push('tedious');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize@^1.0.0');
          break;
      }
    },

    services: function() {
      this.props.services = [];

      if (this.props.database) {
        // If auth is enabled also create a user service
        if (this.props.localAuth || this.props.authentication.length) {
          this.props.services.push('user');

          var providers = this.props.authentication.slice();

          if (this.props.localAuth) {
            providers.push('local');
          }

          this.composeWith('feathers:service', {
            options: {
              type: 'database',
              database: this.props.database,
              name: 'user',
              authentication: true,
              providers: providers
            }
          });
        }

        this.fs.copyTpl(
          this.templatePath('service.js'),
          this.destinationPath('src/services', 'index.js'),
          this.props
        );
      }
    },

    application: function() {
      this.fs.copy(this.templatePath('static'), this.destinationPath());
      this.fs.copy(this.templatePath('static/.*'), this.destinationPath());
      this.fs.copy(this.templatePath('_gitignore'), this.destinationPath('', '.gitignore'));

      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('', 'README.md'),
        this.props
      );

      this.fs.copyTpl(
        this.templatePath('app.js'),
        this.destinationPath('src', 'app.js'),
        this.props
      );

      if(this.props.babel) {
        this.fs.copyTpl(
          this.templatePath('.babelrc'),
          this.destinationPath('.babelrc'),
          this.props
        );
      }
    },

    middleware: function() {
      this.fs.copyTpl(
        this.templatePath('middleware.js'),
        this.destinationPath('src/middleware', 'index.js'),
        this.props
      );
    },

    config: function() {
      this.fs.copyTpl(
        this.templatePath('config.default.json'),
        this.destinationPath('config', 'default.json'),
        this.props
      );

      this.fs.copyTpl(
        this.templatePath('config.production.json'),
        this.destinationPath('config', 'production.json'),
        this.props
      );

      this.fs.copyTpl(
        this.templatePath('package.json'),
        this.destinationPath('package.json'),
        this.props
      );
    },

    deps: function() {
      var devDependencies = [
        'jshint',
        'mocha',
        'request'
      ];

      if(this.props.babel) {
        devDependencies.push('babel-cli', 'babel-core', 'babel-preset-es2015');
      }

      this.dependencies.concat(devDependencies).forEach(function(dependency) {
        var separatorIndex = dependency.indexOf('@');
        var end = separatorIndex !== -1 ? separatorIndex : dependency.length;
        var dependencyName = dependency.substring(0, end);

        // Throw an error if the project name is the same as one of the dependencies
        if(dependencyName === this.props.name) {
          this.log.error('Your project can not be named ' + this.props.name + ' because the ' +
            dependency + ' package will be installed as dependency.');
          process.exit(1);
        }
      }.bind(this));
      
      this.npmInstall(this.dependencies, { save: true });
      this.npmInstall(devDependencies, { saveDev: true});
    }
  },

  end: function() {
    this.log('\nWoot! We\'ve created your "' + this.props.name + '" app!');

    switch(this.props.database) {
      case 'mongodb':
      case 'mssql':
      case 'mysql':
      case 'mariadb':
      case 'postgres':
        this.log('Make sure that your ' + this.props.database +
          ' database is running. The username/role is correct and the database ' +
          this.props.databaseName + ' has been created. ' +
          'Default information can be found in the projects config folder.');
        break;
    }

    this.log('To start your feathers server run `npm start`.');
  }
});
