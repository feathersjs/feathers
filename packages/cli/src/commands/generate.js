import yeoman from 'yeoman-environment';

const env = yeoman.createEnv();

const generators = 'generator-feathers/generators';

env.register(require.resolve(`${generators}/app`), 'feathers:app');
env.register(require.resolve(`${generators}/hook`), 'feathers:hook');
env.register(require.resolve(`${generators}/middleware`), 'feathers:middleware');
env.register(require.resolve(`${generators}/model`), 'feathers:model');
env.register(require.resolve(`${generators}/service`), 'feathers:service');

export default function(vorpal) {
  vorpal
    .command('generate ', 'alias for generate app')
    .autocomplete(['app', 'hook', 'middleware', 'model', 'service'])
    .action(function (args, callback) {
      this.log('');
      env.run('feathers:app', callback);
    });

  vorpal
    .command('generate app')
    .description('generate new application')
    .action(function (args, callback) {
      this.log('');
      env.run('feathers:app', callback);
    });

  vorpal
    .command('generate hook')
    .description('generate new hook')
    .action(function (args, callback) {
      this.log('');
      env.run('feathers:hook', callback);
    });

  vorpal
    .command('generate middleware')
    .description('generate new middleware')
    .action(function (args, callback) {
      this.log('');
      env.run('feathers:middleware', callback);
    });

  vorpal
    .command('generate model')
    .description('generate new model')
    .action(function (args, callback) {
      this.log('');
      env.run('feathers:model', callback);
    });

  vorpal
    .command('generate service')
    .description('generate new service')
    .action(function (args, callback) {
      this.log('');
      env.run('feathers:service', callback);
    });
}

export { env };
