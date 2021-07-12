const path = require('path');
const { readFile } = require('fs').promises;
const loadJSON = name => readFile(name).then(JSON.parse).catch(() => ({}));

module.exports = {
  async prompt ({ prompter, args }) {
    const pkg = await loadJSON(path.join(process.cwd(), 'package.json'));
    const name = pkg.name || process.cwd().split(path.sep).pop();
    const data = await prompter.prompt([{
      type: 'select',
      name: 'language',
      message: 'Do you want to use JavaScript or TypeScript?',
      choices: [
        { message: 'JavaScript', name: 'js' },
        { message: 'TypeScript', name: 'ts'  }
      ],
      skip: args.language
    }, {
      type: 'input',
      name: 'name',
      message: 'What is the name of your application?',
      default: name,
      skip: args.name
    }, {
      type: 'input',
      name: 'description',
      message: 'Description',
      skip: pkg.description || args.description
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
      ],
      skip: args.database
    }, {
      type: 'input',
      name: 'lib',
      message: 'What folder should the source files live in?',
      default: 'src',
      skip: pkg.directories?.lib || args.lib
    }, {
      name: 'packager',
      skip: args.packager,
      type: 'select',
      message: 'Which package manager are you using?',
      hint: 'Has to be installed globally',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'Yarn', value: 'yarn'  }
      ]
    }, {
      type: 'select',
      skip: args.tests,
      name: 'tester',
      message: 'Which testing framework do you prefer?',
      choices: [
        { name: 'mocha', message: 'Mocha' },
        { name: 'jest', message: 'Jest' }
      ]
    }, {
      type: 'multiselect',
      name: 'transports',
      skip: args.transports,
      message: 'What APIs do you want to offer?',
      initial: [0, 1],
      choices: [
        { value: 'rest', message: 'HTTP (REST)' },
        { value: 'websockets', message: 'Real-time (websockets)' }
      ]
    }, {
      type: 'select',
      name: 'framework',
      skip: args.framework,
      message: 'Which HTTP framework do you want to use?',
      hint: 'Your app will be fully compatible with the chosen framework',
      choices: [
        { name: 'koa', message: 'KoaJS', hint: 'Recommended' },
        { name: 'express', message: 'Express' }
      ]
    }]);

    return data;
  }
}
