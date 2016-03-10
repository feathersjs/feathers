var generators = require('yeoman-generator');
var fs = require('fs');
var assign = require('object.assign').getPolyfill();
var inflect = require('i')();
var updateMixin = require('../../lib/updateMixin');

function importMiddleware(filename, name, module) {
  // Lookup existing service/index.js file
  if (fs.existsSync(filename)) {
    var content = fs.readFileSync(filename).toString();
    var statement = 'const ' + name + ' = require(\'' + module + '\');';
    var use = '))\n    .use(' + name + '(app));';

    // add if it is not already there
    if (content.indexOf(statement) === -1) {
      content = content.replace(/'use strict';\n\n/, '\'use strict;\'\n\n' + statement + '\n');
      content = content.replace(/\)\)\;/, use);
    }

    fs.writeFileSync(filename, content);
  }
}

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    updateMixin.extend(this);
  },

  initializing: function (name) {
    var done = this.async();
    this.props = { name: name };

    this.props = assign(this.props, this.options);
    this.mixins.notifyUpdate(done);
  },

  prompting: function () {
    var done = this.async();
    var options = this.options;
    var prompts = [
      {
        name: 'name',
        message: 'What do you want to call your middleware?',
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
    this.props.codeName = inflect.camelize(inflect.underscore(this.props.name), false);

    var middlewareIndexPath = this.destinationPath('src/middleware/index.js');

    this.fs.copyTpl(
      this.templatePath('middleware.js'),
      this.destinationPath('src/middleware', this.props.name + '.js'),
      this.props
    );

    // Automatically import the new service into services/index.js and initialize it.
    importMiddleware(middlewareIndexPath, this.props.codeName, './' + this.props.name);
  }
});
