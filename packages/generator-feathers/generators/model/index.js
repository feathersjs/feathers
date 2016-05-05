'use strict';

var generators = require('yeoman-generator');
var assign = require('object.assign').getPolyfill();
var inflect = require('i')();
var updateMixin = require('../../lib/updateMixin');

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    updateMixin.extend(this);
  },

  initializing: function (name) {
    var done = this.async();
    this.props = {
      name: name,
      type: 'generic'
    };

    this.props = assign(this.props, this.options);
    this.mixins.notifyUpdate(done);
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
        name: 'service',
        message: 'What service does this model belong to?',
        default: this.props.service,
        when: function(){
          return options.service === undefined;
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
      }
    ];

    this.prompt(prompts).then(function (props) {
      this.props = assign(this.props, props);
      this.props.pluralizedName = inflect.pluralize(this.props.name);

      done();
    }.bind(this));
  },

  writing: function () {
    // Generating the appropriate model based on the orm type.
    this.fs.copyTpl(
      this.templatePath(this.props.type + '.js'),
      this.destinationPath('src/services/', this.props.service, this.props.name + '-model.js'),
      this.props
    );
  },

  end: function() {
    // NOTE (EK): Added this as a hack to stop the CLI from
    // hanging when generating a service with a model.
    process.exit();
  }
});
