module.exports = {
  async prompt ({ prompter, args, config }) {
    const { _ } = config.helpers;
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
    const camelName = _.camelCase(name);
    const className = `${_.upperFirst(camelName)}Service`;
    const kebabName = _.kebabCase(name);
    const relative = path.split('/').map(() => '..').join('/');

    return {
      name,
      path,
      relative,
      className,
      camelName,
      kebabName
    };
  }
}
