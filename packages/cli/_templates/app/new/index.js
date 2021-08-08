const path = require('path');

module.exports = {
  async prompt ({ prompter, config }) {
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
      type: 'select',
      name: 'tester',
      message: 'Which testing framework do you prefer?',
      choices: [
        { name: 'mocha', message: 'Mocha' },
        { name: 'jest', message: 'Jest' }
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

  async rendered (_result, config) {
    // Generate the TS/JS specific code files
    await config.helpers.generate({
      generator: 'app',
      action: 'base'
    });
  }
}
