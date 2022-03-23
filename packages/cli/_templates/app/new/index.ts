import path from 'path';
import { EngineResult, FeathersPackageJson, InteractiveHook, PromptOptions, RunnerConfig } from '../../../src';

export type VariablesAppPrompts = FeathersPackageJson & {
  name: string,
  description: string
  lib: string
}

export type VariablesApp = VariablesAppPrompts & {}

const hookmodule: InteractiveHook = {
  async prompt({ prompter, config }: PromptOptions) {
    const { pkg } = config.helpers;
    const name = pkg.name || process.cwd().split(path.sep).pop();
    const data = await prompter.prompt([{
      type: 'select',
      name: 'language',
      message: 'Do you want to use JavaScript or TypeScript?',
      choices: [
        { message: 'JavaScript', name: 'js' },
        { message: 'TypeScript', name: 'ts'  }
      ]
    }, {
      type: 'input',
      name: 'name',
      message: 'What is the name of your application?',
      default: name
    }, {
      type: 'input',
      name: 'description',
      message: 'Description'
    }, {
      type: 'select',
      name: 'database',
      message: 'What is your main database?',
      hint: 'Other databases can be added at any time',
      default: 'sequelize',
      choices: [
        { name: 'sequelize', message: 'SQL (Sequelize)' },
        { name: 'mongodb', message: 'MongoDB' },
        { name: 'custom', message: 'Custom services/another database' }
      ]
    }, {
      type: 'input',
      name: 'lib',
      message: 'What folder should the source files live in?',
      default: 'src'
    }, {
      name: 'packager',
      type: 'select',
      message: 'Which package manager are you using?',
      hint: 'Has to be installed globally',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'Yarn', value: 'yarn'  }
      ]
    }, {
      type: 'multiselect',
      name: 'transports',
      message: 'What APIs do you want to offer?',
      initial: [0, 1],
      choices: [
        { value: 'rest', message: 'HTTP (REST)' },
        { value: 'websockets', message: 'Real-time (websockets)' }
      ]
    }, {
      type: 'select',
      name: 'framework',
      message: 'Which HTTP framework do you want to use?',
      hint: 'Your app will be fully compatible with the chosen framework',
      choices: [
        { name: 'koa', message: 'KoaJS', hint: 'Recommended' },
        { name: 'express', message: 'Express' }
      ]
    }]);

    return data;
  },

  async rendered (_result: EngineResult, config: RunnerConfig) {
    // Generate the TS/JS specific code files
    return await config.helpers.generate({
      generator: 'app',
      action: 'base'
    }, config);
  }
}

export default hookmodule;