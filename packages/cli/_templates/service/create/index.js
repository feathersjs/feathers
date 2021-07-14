const _ = require('lodash');

module.exports = {
  async prompt ({ prompter, args }) {
    const { name } = await prompter.prompt([{
      type: 'input',
      name: 'name',
      message: 'What is the name of your service?',
      skip: !!args.name,
      default: args.name
    }]);
    const { path } = await prompter.prompt([{
      type: 'input',
      name: 'path',
      message: 'What is the path the service should be registered on?',
      default: `${_.kebabCase(name)}`
    }]);
    const className = `${_.upperFirst(_.camelCase(name))}Service`;
    const kebabName = _.kebabCase(name);
    const configureFunction = _.camelCase(name);

    return {
      name,
      path,
      className,
      kebabName,
      configureFunction
    };
  }
}
