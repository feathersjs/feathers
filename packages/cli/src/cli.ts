import chalk from 'chalk'
import { Command } from 'commander'
import { generator, runGenerator, getContext } from '@feathershq/pinion'
import { FeathersBaseContext, version } from './commons'

export * from 'commander'
export { chalk }

export const commandRunner = (name: string) => async (options: any) => {
  const ctx = getContext<FeathersBaseContext>({
    ...options
  })

  await generator(ctx)
    .then(runGenerator(__dirname, name, 'index'))
    .catch((error) => {
      const { logger } = ctx.pinion

      logger.error(`Error: ${chalk.white(error.message)}`)
    })
}

export const program = new Command()

program
  .name('feathers')
  .description('The Feathers command line interface 🕊️')
  .version(version)
  .showHelpAfterError()

const generate = program.command('generate').alias('g')

generate
  .command('app')
  .description('Generate a new application')
  .option('--name <name>', 'The name of the application')
  .action(commandRunner('app'))

generate
  .command('service')
  .description('Generate a new service')
  .option('--name <name>', 'The service name')
  .option('--path <path>', 'The path to register the service on')
  .option('--type <type>', 'The service type (knex, mongodb, custom)')
  .action(commandRunner('service'))

generate
  .command('hook')
  .description('Generate a hook')
  .option('--name <name>', 'The name of the hook')
  .option('--type <type>', 'The hook type (around or regular)')
  .action(commandRunner('hook'))

generate
  .command('connection')
  .description('Add a new database connection')
  .action(commandRunner('connection'))

generate
  .command('authentication')
  .description('Add authentication to the application')
  .action(commandRunner('authentication'))

generate.description(
  `Run a generator. Currently available: \n  ${generate.commands
    .map((cmd) => `${chalk.blue(cmd.name())}: ${cmd.description()} `)
    .join('\n  ')}`
)
