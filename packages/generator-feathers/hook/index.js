'use strict';

var generators = require('yeoman-generator');
var path = require('path');

module.exports = generators.Base.extend({
  initializing: function (name) {
    this.props = {
      name: name
    };
  },

  prompting: function () {
    var done = this.async();
    var prompts = [
      {
        type: 'list',
        name: 'type',
        message: 'What type of hook do you need?',
        choices: [
          {
            name: 'before hook',
            value: 'before',
            checked: true
          },
          {
            name: 'after hook',
            value: 'after'
          }
        ]
      },
      {
        type: 'input',
        name: 'service',
        message: 'What service is this hook for?'
      },
      {
        type: 'list',
        name: 'method',
        message: 'What method is this hook for?',
        choices: [
          {
            name: 'no specific method',
            value: null
          },
          {
            name: 'all',
            value: 'all'
          },
          {
            name: 'find',
            value: 'find'
          },
          {
            name: 'get',
            value: 'get'
          },
          {
            name: 'create',
            value: 'create'
          },
          {
            name: 'update',
            value: 'update'
          },
          {
            name: 'patch',
            value: 'patch'
          },
          {
            name: 'remove',
            value: 'remove'
          }
        ]
      },
      {
        type: 'input',
        name: 'name',
        message: 'What do you want to call your hook?',
      },
      
    ];

    this.prompt(prompts, function (props) {
      this.props = Object.assign(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    this.props.hookPath = path.join('src/hooks', this.props.service, this.props.type, this.props.method ? this.props.method : '', this.props.name + '.js');
    
    // TODO (EK): Automatically import the hook into hooks/index.js
    // so that services can grab it easier.

    this.fs.copyTpl(
      this.templatePath(this.props.type + '-hook.js'),
      this.destinationPath(this.props.hookPath),
      this.props
    );
    
    this.log(this.props);
  }
});

