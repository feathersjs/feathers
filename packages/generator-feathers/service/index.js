'use strict';

var generators = require('yeoman-generator');
var fs = require('fs');
var inflect = require('i')();

function addServiceImport(filename, module, name) {
  if(fs.existsSync(filename)) {
    var content = fs.readFileSync(filename).toString();
    var statement = '\nimport ' + name + ' from \'' + module + '\';';
    var configure = 'app.configure(' + name + ')';

    // Also add if it is not already there
    if(content.indexOf(statement) === -1) {
      content = statement + '\n' + content;
      content = content.replace(/\}(?!.*?\})/, configure);
    }
    
    fs.writeFileSync(filename, content);
  }
}

module.exports = generators.Base.extend({
  initializing: function (name) {
    this.props = { name: name };

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
      }
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

    // TODO (EK): Automatically import the new service
    // into services/index.js and initialize it.
    this.props.pluralizedName = inflect.pluralize(this.props.name);

    var servicePath = this.destinationPath('server/services', this.props.name + '.js');

    this.fs.copyTpl(
      this.templatePath(this.props.type + '-service.js'),
      servicePath,
      this.props
    );

    addServiceImport(servicePath, this.props.name, './' + this.props.name + '.js');
  }
});
