// taken from @feathersjs/hygen

import {
  Arguments,
  InteractiveHook,
  RunnerConfig,
  PromptList,
  RunnerArgs,
  HookModule
} from './types'

const prompt = (
  config: RunnerConfig,
  runnerArgs: RunnerArgs,
  hookModule: HookModule = null
): Promise<Arguments> => {
  const { args } = runnerArgs

  if (!hookModule) {
    return Promise.resolve({})
  }

  const { createPrompter } = config
  const hooksModule = hookModule as InteractiveHook

  if (hooksModule.params) {
    return hooksModule.params({ args, config })
  }

  // lazy loads prompter
  // everything below requires it
  const prompter = createPrompter()
  if (hooksModule.prompt) {
    return hooksModule.prompt({
      args,
      config,
      prompter,
      inquirer: prompter
    })
  }

  return prompter.prompt(
    // prompt _only_ for things we've not seen on the CLI
    (hookModule as PromptList).filter(
      (p) =>
        args[p.name] === undefined ||
        args[p.name] === null ||
        args[p.name].length === 0
    )
  )
}

export default prompt