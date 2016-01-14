'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var inflect = require('i')();

module.exports = generators.Base.extend({
  initializing: function (name) {
    this.props = {
      name: name,
      version: 'v1'
    };

    this.props = Object.assign(this.props, this.options);
  },

  prompting: function () {
    var done = this.async();
    var options = this.options;
    var prompts = [
      {
        type: 'list',
        name: 'type',
        message: 'What type of service do you need?',
        default: this.props.type,
        store: true,
        when: function(){
          return options.type === undefined;
        },
        choices: [
          {
            name: 'generic',
            value: 'generic',
            checked: true
          },
          {
            name: 'database',
            value: 'database'
          }
        ]
      },
      {
        type: 'list',
        name: 'database',
        message: 'For which database?',
        store: true,
        default: this.props.database,
        when: function(answers){
          return options.database === undefined && answers.type === 'database';
        },
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
          }
        ]
      },
      {
        name: 'name',
        message: 'What do you want to call your service?',
        default: this.props.name,
        when: function(){
          return options.name === undefined;
        },
      },
      {
        type: 'confirm',
        name: 'hazVersions',
        message: 'Do you have API versions?',
        store: true,
        default: true,
        when: function(){
          return options.hazVersions === undefined;
        },
      },
      {
        name: 'version',
        message: 'What API version do you want to use?',
        default: this.props.version,
        store: true,
        when: function(answers){
          return options.version === undefined && answers.hazVersions;
        }
      },

    ];

    this.prompt(prompts, function (props) {
      this.props = Object.assign(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    // Generating the appropriate service
    // based on the database.
    if (this.props.type === 'database') {
      switch(this.props.database) {
        case 'sqlite':
        case 'mssql':
        case 'mysql':
        case 'mariadb':
        case 'postgres':
          this.props.type = 'sequelize';

          // Automatically generate a new model
          // based on the database type.
          this.composeWith('feathers:model', {
            options: {
              type: this.props.type,
              name: this.props.name
            }
          });
          break;
        case 'mongodb':
          this.props.type = 'mongoose';

          // Automatically generate a new model
          // based on the database type.
          this.composeWith('feathers:model', {
            options: {
              type: this.props.type,
              name: this.props.name
            }
          });
          break;
        case 'memory':
          this.props.type = 'memory';
          break;
        case 'nedb':
          this.props.type = 'nedb';
          break;
      }
    }
    else {
      this.npmInstall(['feathers-errors'], { save: true });
    }

    // TODO (EK): Automatically import the new service
    // into services/index.js and initialize it.
    this.props.pluralizedName = inflect.pluralize(this.props.name);

    this.fs.copyTpl(
      this.templatePath(this.props.type + '-service.js'),
      this.destinationPath('server/services', this.props.name + '.js'),
      this.props
    );
  }
});

