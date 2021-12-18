// taken from @feathersjs/hygen

import fs from 'fs-extra'

import {
  EngineResult,
  InteractiveHook,
  RunnerArgs,
  RunnerConfig
} from './types'
import getParams from './getParams'
import loadHookModule from './hookmodule'

class ShowHelpError extends Error {
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, ShowHelpError.prototype)
  }
}

const engine = async (
  runnerArgs: RunnerArgs,
  config: RunnerConfig
): Promise<EngineResult> => {
  const { cwd, templates, logger } = config
  const hookModule = await loadHookModule(config, runnerArgs)

  const params = await getParams(config, runnerArgs, hookModule);

  const args = Object.assign(params, { cwd })
  const { generator, action, actionfolder } = args

  if (args.h || args.help) {
    logger.log(`
Usage:
  hygen [option] GENERATOR ACTION [--name NAME] [data-options]
Options:
  -h, --help # Show this message and quit
  --dry      # Perform a dry run.  Files will be generated but not saved.`)
    process.exit(0)
  }

  logger.log(args.dry ? '(dry mode)' : '')

  if (!generator) {
    throw new ShowHelpError('please specify a generator.')
  }

  if (!action) {
    throw new ShowHelpError(`please specify an action for ${generator}.`)
  }

  if (config.debug) {
    logger.log(`Loaded templates: ${templates.replace(`${cwd}/`, '')}`)
  }

  if (!(fs.existsSync(actionfolder))) {
    throw new ShowHelpError(`I can't find action '${action}' for generator '${generator}'.
      You can try:
      1. 'hygen init self' to initialize your project, and
      2. 'hygen generator new --name ${generator}' to build the generator you wanted.
      Check out the quickstart for more: http://www.hygen.io/quick-start
    `)
  }

  // lazy loading these dependencies gives a better feel once
  // a user is exploring hygen (not specifying what to execute)
  const render = await import('./render')
  const rendered = await render.default(args, config);

  const execute = await import('./execute')
  const actions = await execute.default(rendered, args, config)

  const result: EngineResult = { args, actions, hookModule }
  const interactiveHook = hookModule as InteractiveHook

  if (interactiveHook && interactiveHook.rendered) {
    await interactiveHook.rendered(result, config)
  }

  return result
}

export { ShowHelpError }
export default engine