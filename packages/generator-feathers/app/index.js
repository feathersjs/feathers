'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var crypto = require('crypto');
var _ = require('lodash');

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: process.cwd().split(path.sep).pop()
    };
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
        choices: [
          {
            name: 'I will choose my own',
            checked: true
          },
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
          }
        ]
      },
      {
        type: 'checkbox',
        name: 'authentication',
        message: 'What authentication methods would you like to support?',
        choices: [
          {
            name: 'local',
            checked: true
          }
        //   name: 'basic'
        // }, {
          
        // }, {
        //   name: 'google'
        // }, {
        //   name: 'facebook'
        // }, {
        //   name: 'twitter'
        // }, {
        //   name: 'github'
        ]
      }
    ];

    this.prompt(prompts, function (props) {
      this.props = _.extend(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    this.props.secret = crypto.randomBytes(64).toString('base64');
    this.props.corsWhitelist = this.props.corsWhitelist && this.props.corsWhitelist.split(',');
    var dependencies = [
      'feathers@2.0.0-pre.2',
      'feathers-hooks@1.0.0-pre.1',
      'feathers-configuration',
      'serve-favicon',
      'compression',
      'winston',
      'babel-core',
      'babel-preset-es2015'
    ];

    if (this.props.providers.indexOf('rest') !== -1) {
      dependencies.push('body-parser');
      dependencies.push('feathers-rest');
    }

    if (this.props.providers.indexOf('socket.io') !== -1) {
      dependencies.push('feathers-socketio');
    }

    if (this.props.providers.indexOf('primus') !== -1) {
      dependencies.push('feathers-primus');
    }

    if (this.props.authentication.length) {
      dependencies.push('feathers-authentication');
    }
    
    if (this.props.cors) {
      dependencies.push('cors');
    }

    switch(this.props.database) {
      case 'memory':
        dependencies.push('feathers-memory');
        this.fs.copyTpl(
          this.templatePath('services/memory-user.js'),
          this.destinationPath('server/services', 'user.js'),
          this.props
        );
        break;
      case 'mongodb':
        dependencies.push('mongoose');
        dependencies.push('feathers-mongoose');
        this.fs.copyTpl(
          this.templatePath('models/mongoose-user.js'),
          this.destinationPath('server/models', 'user.js'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('services/mongoose-user.js'),
          this.destinationPath('server/services', 'user.js'),
          this.props
        );
        break;
      case 'mysql':
      case 'mariadb':
        dependencies.push('mysql');
        dependencies.push('sequelize');
        dependencies.push('feathers-sequelize');
        this.fs.copyTpl(
          this.templatePath('models/sequelize-user.js'),
          this.destinationPath('server/models', 'user.js'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('services/sequelize-user.js'),
          this.destinationPath('server/services', 'user.js'),
          this.props
        );
        break;
      case 'nedb':
        dependencies.push('nedb');
        dependencies.push('feathers-nedb');
        this.fs.copyTpl(
          this.templatePath('services/nedb-user.js'),
          this.destinationPath('server/services', 'user.js'),
          this.props
        );
        break;
      case 'postgres':
        dependencies.push('pg');
        dependencies.push('pg-hstore');
        dependencies.push('sequelize');
        dependencies.push('feathers-sequelize');
        this.fs.copyTpl(
          this.templatePath('models/sequelize-user.js'),
          this.destinationPath('server/models', 'user.js'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('services/sequelize-user.js'),
          this.destinationPath('server/services', 'user.js'),
          this.props
        );
        break;
      case 'sqlite':
        dependencies.push('sqlite3');
        dependencies.push('sequelize');
        dependencies.push('feathers-sequelize');
        this.fs.copyTpl(
          this.templatePath('models/sequelize-user.js'),
          this.destinationPath('server/models', 'user.js'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('services/sequelize-user.js'),
          this.destinationPath('server/services', 'user.js'),
          this.props
        );
        break;
      case 'mssql':
        dependencies.push('tedious');
        dependencies.push('sequelize');
        dependencies.push('feathers-sequelize');
        this.fs.copyTpl(
          this.templatePath('models/sequelize-user.js'),
          this.destinationPath('server/models', 'user.js'),
          this.props
        );
        this.fs.copyTpl(
          this.templatePath('services/sequelize-user.js'),
          this.destinationPath('server/services', 'user.js'),
          this.props
        );
        break;
    }

    this.fs.copy(this.templatePath('static'), this.destinationPath());
    this.fs.copy(this.templatePath('static/.*'), this.destinationPath());

    this.fs.copyTpl(
      this.templatePath('app.js'),
      this.destinationPath('server', 'app.js'),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath('middleware.js'),
      this.destinationPath('server/middleware', 'index.js'),
      this.props
    );
    
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
    
    this.log(this.props);

    this.npmInstall(dependencies, { save: true });

    this.npmInstall([
      'jshint',
      'mocha',
      'request'
    ], { saveDev: true});
  }
});
