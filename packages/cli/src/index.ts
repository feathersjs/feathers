import { Argv, generator, runGenerator, getContext } from '@feathershq/pinion'
import { FeathersBaseContext, initializeBaseContext } from './commons'

export const commandRunner = (yarg: any) => {
  const ctx = getContext<FeathersBaseContext>({
    ...yarg.argv
  })

  return generate(ctx)
}

export const generate = (ctx: FeathersBaseContext) =>
  generator(ctx)
    .then(initializeBaseContext())
    .then(runGenerator(__dirname, (ctx: FeathersBaseContext) => `${ctx._[1]}`, 'index'))

export const command = (yargs: Argv) =>
  yargs
    .command('generate', 'Run a generator', (yarg) =>
      yarg
        .command('app', 'Generate a new app', commandRunner)
        .command('service', 'Generate a service', commandRunner)
        .command('connection', 'Connect to a different database', commandRunner)
        .command('hook', 'Generate a hook', commandRunner)
    )
    .usage('Usage: $0 <command> [options]')
    .help()
