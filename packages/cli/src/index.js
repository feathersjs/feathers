import vorpalBuilder from 'vorpal';

const vorpal = vorpalBuilder();

const moduleNames = ['generate'];

moduleNames.forEach(moduleName => {
  require('./commands/' + moduleName)(vorpal);
});

vorpal
    .delimiter('feathers$')
    .show();
