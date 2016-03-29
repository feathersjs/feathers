import vorpalBuilder from 'vorpal';
import generateCmd from './commands/generate';

export default function() {
  const vorpal = vorpalBuilder();

  // decorate vorpal with commands
  generateCmd(vorpal);

  vorpal.log(`Feathers CLI\n`);

  if (process.argv.length > 2) {
    // one and done
    vorpal
      .parse(process.argv);
  }
  else {
    // interactive shell
    vorpal.log('Type "exit" to quit, "help" for a list of commands.');
    vorpal
      .delimiter('feathers$')
      .show();

  }
}
