import vorpalBuilder from 'vorpal';
import generate from './commands/generate';

export default function() {
  const vorpal = vorpalBuilder();

  // add commands
  generate(vorpal);

  // kick off
  vorpal
    .delimiter('feathers$')
    .show()
    .parse(process.argv);
}
