import yeoman from 'yeoman-environment';

const env = yeoman.createEnv();

env.lookup();

export default function(vorpal) {
  vorpal
    .command('generate ', 'alias for generate app')
    .autocomplete(['app', 'hook', 'middleware', 'model', 'service'])
    .action(function (args, callback) {
      env.run('feathers:app', callback);
    });

  vorpal
    .command('generate app')
    .description('generate new application')
    .action(function (args, callback) {
      env.run('feathers:app', callback);
    });

  vorpal
    .command('generate hook')
    .description('generate new hook')
    .action(function (args, callback) {
      env.run('feathers:hook', callback);
    });

  vorpal
    .command('generate middleware')
    .description('generate new middleware')
    .action(function (args, callback) {
      env.run('feathers:middleware', callback);
    });

  vorpal
    .command('generate model')
    .description('generate new model')
    .action(function (args, callback) {
      env.run('feathers:model', callback);
    });

  vorpal
    .command('generate service')
    .description('generate new service')
    .action(function (args, callback) {
      env.run('feathers:service', callback);
    });
}
