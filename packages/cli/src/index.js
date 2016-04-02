import vorpal from 'vorpal';

const commands = [
  'generate'
];

export default function() {
  const app = vorpal();

  commands.map((cmd) => require(`./commands/${cmd}`).default(app));

  if (process.argv.length > 2) {
    // one and done
    app.parse(process.argv);
  }
  else {
    // interactive shell
    app.log(`Welcome to the Feathers command line.`);
    app.log('Type "exit" to quit, "help" for a list of commands.');

    app
      .delimiter('feathers$')
      .show();
  }
}
