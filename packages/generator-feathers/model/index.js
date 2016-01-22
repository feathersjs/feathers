'use strict';

var generators = require('yeoman-generator');
var path = require('path');

module.exports = generators.Base.extend({
  initializing: function (name) {
    this.props = {
      name: name,
      type: 'generic'
    };

    this.props = Object.assign(this.props, this.options);
  },

  prompting: function () {
    var done = this.async();
    var options = this.options;
    var prompts = [
      {
        name: 'name',
        message: 'What do you want to call your model?',
        default: this.props.name,
        when: function(){
          return options.name === undefined;
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'What type of model do you need?',
        default: this.props.type,
        store: true,
        when: function(){
          return options.type === undefined;
        },
        choices: [
          {
            name: 'generic',
            value: 'generic'
          },
          {
            name: 'Mongoose',
            value: 'mongoose'
          },
          {
            name: 'Sequelize',
            value: 'sequelize'
          }
        ]
      },
      // {
      //   type: 'list',
      //   name: 'database',
      //   message: 'For which database?',
      //   store: true,
      //   default: this.props.database,
      //   when: function(answers){
      //     return options.database === undefined && answers.type === 'database';
      //   },
      //   choices: [
      //     {
      //       name: 'Memory',
      //       value: 'memory'
      //     },
      //     {
      //       name: 'MongoDB',
      //       value: 'mongodb'
      //     },
      //     {
      //       name: 'MySQL',
      //       value: 'mysql'
      //     },
      //     {
      //       name: 'MariaDB',
      //       value: 'mariadb'
      //     },
      //     {
      //       name: 'NeDB',
      //       value: 'nedb'
      //     },
      //     {
      //       name: 'PostgreSQL',
      //       value: 'postgres'
      //     },
      //     {
      //       name: 'SQLite',
      //       value: 'sqlite'
      //     },
      //     {
      //      name: 'SQL Server',
      //      value: 'mssql'
      //     }
      //   ]
      // },
    ];

    this.prompt(prompts, function (props) {
      this.props = Object.assign(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    // TODO (EK): Automatically import the new model
    // into models/index.js and initialize it.
    
    // Generating the appropriate model
    // based on the orm type.
    this.fs.copyTpl(
      this.templatePath(this.props.type + '.js'),
      this.destinationPath('server/models', this.props.name + '.js'),
      this.props
    );
  }
});
