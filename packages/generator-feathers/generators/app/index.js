'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var crypto = require('crypto');
var S = require('string');
var AUTH_PROVIDERS = require('./auth-mapping.json');

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: process.cwd().split(path.sep).pop(),
      S: S
    };
    this.dependencies = [
      'feathers@2.0',
      'feathers-hooks@1.0',
      'feathers-errors@2.0',
      'feathers-configuration@0.1.0',
      'serve-favicon',
      'compression',
      'winston'
    ];
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
            value: AUTH_PROVIDERS['local'],
          },
          {
            name: 'bitbucket',
            value: AUTH_PROVIDERS['bitbucket'],
          },
          {
            name: 'dropbox',
            value: AUTH_PROVIDERS['dropbox'],
          },
          {
            name: 'facebook',
            value: AUTH_PROVIDERS['facebook'],
          },
          {
            name: 'github',
            value: AUTH_PROVIDERS['github'],
          },
          {
            name: 'google',
            value: AUTH_PROVIDERS['google'],
          },
          {
            name: 'instagram',
            value: AUTH_PROVIDERS['instagram'],
          },
          {
            name: 'linkedin',
            value: AUTH_PROVIDERS['linkedin'],
          },
          {
            name: 'paypal',
            value: AUTH_PROVIDERS['paypal'],
          },
          {
            name: 'spotify',
            value: AUTH_PROVIDERS['spotify']
          }
        ]
      }
    ];

    this.prompt(prompts, function (props) {
      this.props = Object.assign(this.props, props);
      this.props.databaseName = S(this.props.name).camelize().s;
      done();
    }.bind(this));
  },

  writing: {
    providers: function() {
      if (this.props.providers.indexOf('rest') !== -1) {
        this.dependencies.push('body-parser');
        this.dependencies.push('feathers-rest@1.0');
      }

      if (this.props.providers.indexOf('socket.io') !== -1) {
        this.dependencies.push('feathers-socketio@1.0');
      }

      if (this.props.providers.indexOf('primus') !== -1) {
        this.dependencies.push('feathers-primus@1.0');
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

      if (this.props.authentication.length) {
        this.dependencies.push('feathers-authentication@0.3');
        this.dependencies.push('passport');

        this.props.localAuth = false;

        this.props.authentication = this.props.authentication.filter(provider => {
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
        });

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
          this.dependencies.push('feathers-memory@0.6');
          break;
        case 'mongodb':
          this.dependencies.push('mongoose');
          this.dependencies.push('feathers-mongoose@3.0');
          break;
        case 'mysql':
        case 'mariadb':
          this.dependencies.push('mysql');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize@1.0');
          break;
        case 'nedb':
          this.dependencies.push('nedb');
          this.dependencies.push('feathers-nedb@2.0');
          break;
        case 'postgres':
          this.dependencies.push('pg');
          this.dependencies.push('pg-hstore');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize@1.0');
          break;
        case 'sqlite':
          this.dependencies.push('sqlite3');
          this.dependencies.push('fs-extra');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize@1.0');
          break;
        case 'mssql':
          this.dependencies.push('tedious');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize@1.0');
          break;
      }
    },

    services: function() {
      this.props.services = [];

      if (this.props.database) {
        // If auth is enabled also create a user service
        if (this.props.authentication.length) {
          this.props.services.push('user');

          this.composeWith('feathers:service', {
            options: {
              type: 'database',
              database: this.props.database,
              name: 'user',
              authentication: true
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
      this.npmInstall(this.dependencies, { save: true });

      this.npmInstall([
        'jshint',
        'mocha',
        'request'
      ], { saveDev: true});
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
        this.log('Make sure that your ' + this.props.database + ' database is running...');
        break;
    }

    this.log('To start your feathers server run `npm start`.');
  }
});
