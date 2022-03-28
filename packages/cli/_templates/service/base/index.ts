import { PromptOptions } from '../../../src';

export type VariablesServicePrompts = {
  name: string,
  path: string,
}

export type VariablesService = VariablesServicePrompts & {
  camelName: string,
  className: string,
  kebabName: string,
  relative: string
}

export default {
  async prompt ({ prompter, args, config }: PromptOptions): Promise<VariablesService> {
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
