'use strict';

const Generator = require('../../lib/generator');
const { kebabCase, camelCase } = require('lodash');
const j = require('../../lib/transform');

module.exports = class MiddlewareGenerator extends Generator {
  prompting() {
    this.checkPackage();
    
    const prompts = [
      {
        name: 'name',
        message: 'What is the name of the Express middleware?'
      },
      {
        name: 'path',
        message: 'What is the mount path?',
        default: '*'
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props, {
        kebabName: kebabCase(props.name),
        camelName: camelCase(props.name)
      });
    });
  }

  _transformCode(code) {
    const { props } = this;
    const ast = j(code);
    const useNotFound = ast.findExpressionStatement('use', 'notFound');
    const mainExpression = ast.find(j.FunctionExpression)
      .closest(j.ExpressionStatement);
    const requireCall = `const ${props.camelName} = require('./${props.kebabName}');`;

    if(useNotFound.length === 0) {
      throw new Error(`Could not find 'app.use(notFound())' before which to insert the new middleware. Did you modify ${this.libDirectory}/middleware/index.js?`);
    }

    if(mainExpression.length !== 1) {
      throw new Error(`${this.libDirectory}/middleware/index.js seems to have more than one function declaration and we can not register the new middleware. Did you modify it?`);
    }

    const middlewareCode = props.path === '*' ? `app.use(${props.camelName}());` : `app.use('${props.path}', ${props.camelName}());`;

    mainExpression.insertBefore(requireCall);
    useNotFound.insertBefore(middlewareCode);

    return ast.toSource();
  }

  writing() {
    const context = this.props;
    const mainFile = this.destinationPath(this.libDirectory, 'middleware', `${context.kebabName}.js`);

    // Do not run code transformations if the middleware file already exists
    if(!this.fs.exists(mainFile)) {
      const middlewarejs = this.destinationPath(this.libDirectory, 'middleware', 'index.js');
      const transformed = this._transformCode(
        this.fs.read(middlewarejs).toString()
      );

      this.conflicter.force = true;
      this.fs.write(middlewarejs, transformed);
    }

    this.fs.copyTpl(
      this.templatePath('middleware.js'),
      mainFile, context
    );
  }
};
