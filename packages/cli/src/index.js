import vorpalBuilder from 'vorpal';

const moduleNames = ['generate'];

export default function() {
  const vorpal = vorpalBuilder();

  moduleNames.forEach(moduleName => {
    require('./commands/' + moduleName)(vorpal);
  });

  vorpal
    .delimiter('feathers$')
    .show()
    .parse(process.argv);
}
