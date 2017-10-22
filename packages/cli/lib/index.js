const yeoman = require('yeoman-environment');
const program = require('commander');
const meta = require('generator-feathers/meta');
const semver = require('semver');

const env = yeoman.createEnv();

const feathersGenerators = 'generator-feathers/generators';

Object.keys(meta).forEach(name => {
  const moduleName = name === 'plugin' ? 'generator-feathers-plugin' : `${feathersGenerators}/${name}`;
  env.register(require.resolve(moduleName), `feathers:${name}`);
});

module.exports = function (argv, generatorOptions = {}) {
  let description = 'Run a generator. Type can be\n';

  Object.keys(meta).forEach(name => {
    description += `\t• ${name} - ${meta[name]}\n`;
  });

  program.version(require('../package.json').version)
    .usage('generate [type]');

  if (!semver.satisfies(process.version, '>= 6.0.0')) {
    console.error('The Feathers CLI and generated application requires Node v6.0.0 or later.');
    return process.exit(1);
  }

  program.command('generate [type]')
    .alias('g')
    .description(description)
    .action(type => {
      if (!type) {
        program.help();
      } else {
        env.run(`feathers:${type}`, generatorOptions);
      }
    });

  program.command('*').action(() => program.help());
  program.parse(argv);

  if (argv.length === 2) {
    program.help();
  }
};
