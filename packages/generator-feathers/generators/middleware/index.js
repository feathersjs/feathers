const { kebabCase, camelCase } = require('lodash');
const j = require('@feathersjs/tools').transform;
const validate = require('validate-npm-package-name');
const Generator = require('../../lib/generator');

module.exports = class MiddlewareGenerator extends Generator {
  prompting () {
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
        kebabName: validate(props.name).validForNewPackages ? props.name : kebabCase(props.name),
        camelName: camelCase(props.name)
      });
    });
  }

  _transformCode (code) {
    const { props } = this;
    const ast = j(code);
    const mainExpression = ast.find(j.FunctionExpression)
      .closest(j.ExpressionStatement);

    if (mainExpression.length !== 1) {
      throw new Error(`${this.libDirectory}/middleware/index.js seems to have more than one function declaration and we can not register the new middleware. Did you modify it?`);
    }

    const middlewareRequire = `const ${props.camelName} = require('./${props.kebabName}');`;
    const middlewareCode = props.path === '*' ? `app.use(${props.camelName}());` : `app.use('${props.path}', ${props.camelName}());`;

    mainExpression.insertBefore(middlewareRequire);
    mainExpression.insertLastInFunction(middlewareCode);

    return ast.toSource();
  }

  writing () {
    const context = this.props;
    const mainFile = this.destinationPath(this.libDirectory, 'middleware', `${context.kebabName}.js`);

    // Do not run code transformations if the middleware file already exists
    if (!this.fs.exists(mainFile)) {
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
