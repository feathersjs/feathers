'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var fs = require('fs');
var inflect = require('i')();

function importHook(filename, name, module, type, method) {
  // Lookup existing services/<service-name>/hooks/index.js file
  if (fs.existsSync(filename)) {
    var content = fs.readFileSync(filename).toString();
    var statement = 'import ' + name + ' from \'' + module + '\';';
    var expression = new RegExp( '(' + type + '(.|\n)+?' + method + '.+?)(\]{1})' );

    // Also add if it is not already there
    if (content.indexOf(statement) === -1) {
      content = statement + '\n' + content;
      content = content.replace(expression, '$1' + name + '(), $3');
    }
    
    fs.writeFileSync(filename, content);
  }
}

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
        store: true,
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
        store: true,
        message: 'What service is this hook for?'
      },
      {
        type: 'list',
        name: 'method',
        store: true,
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
    var hookIndexPath = path.join('src/services/', this.props.service, 'hooks/index.js');
    this.props.hookPath = path.join('src/services/', this.props.service, 'hooks/', this.props.name + '.js');
    // this.props.hookTestPath = path.join('test/services/', this.props.service, 'hooks/', this.props.name + '.test.js');
    this.props.codeName = inflect.camelize(inflect.underscore(this.props.name), false);
    
    // Automatically import the hook into services/<service-name>/hooks/index.js and initialize it.
    importHook(hookIndexPath, this.props.codeName, './' + this.props.name, this.props.type, this.props.method);
    
    // copy the hook
    this.fs.copyTpl(
      this.templatePath(this.props.type + '-hook.js'),
      this.destinationPath(this.props.hookPath),
      this.props
    );

    // copy the hook test
    // this.fs.copyTpl(
    //   this.templatePath(this.props.type + '-hook.test.js'),
    //   this.destinationPath(this.props.hookTestPath),
    //   this.props
    // );
  }
});

