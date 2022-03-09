import {
  Argv, PinionContext, generator, runGenerator, loadJSON, fromFile, getContext
} from '@feathershq/pinion'

export interface FeathersBaseContext extends PinionContext {
  pkg: any
}

export const generate = (ctx: FeathersBaseContext) => generator(ctx)
  .then(loadJSON(fromFile('package.json'), pkg => ({ pkg }), {}))
  .then(runGenerator(__dirname, (ctx: FeathersBaseContext) => ctx._[0], 'index'))

export const command = (yargs: Argv) => yargs
  .usage('Usage: $0 <command> [options]')
  .command('app', 'Generate a new app', () => {}, argv => {
    const ctx = getContext<FeathersBaseContext>({
      ...argv,
      command: argv._[0]
    })

    return generate(ctx)
  })
  .help()
