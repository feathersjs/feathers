// taken from @feathersjs/hygen

import path from 'path'
import { RunnerConfig, ParamsResult, RunnerArgs, HookModule } from './types'
import prompt from './prompt'

const getParams = async (
  config: RunnerConfig,
  runnerArgs: RunnerArgs,
  hookModule: HookModule = null
): Promise<ParamsResult> => {
  const { generator, action, name, subaction } = runnerArgs
  const { templates } = config

  if (!generator || !action) {
    return { generator, action, templates }
  }

  const actionfolder = path.join(templates, generator, action)
  const baseArgs = {
    ...runnerArgs.args,
    ...(name && { name }),
    templates,
    actionfolder,
    generator,
    action,
    subaction
  }

  const promptArgs = await prompt(config, runnerArgs, hookModule)

  return {
    ...baseArgs,
    ...promptArgs
  }
}

export default getParams