// taken from @feathersjs/hygen

import fs from 'fs'
import path from 'path'
import { RunnerArgs, HookModule, RunnerConfig } from './types'

export default async (
  config: RunnerConfig,
  args: RunnerArgs,
  hooksfiles = ['prompt.ts', 'index.ts']
): Promise<HookModule> => {
  const { generator, action } = args
  const { templates } = config
  const actionfolder = path.join(templates, generator, action)
  const hooksfile = hooksfiles
    .map((f) => path.resolve(path.join(actionfolder, f)))
    .find((f) => fs.existsSync(f))

  if (!hooksfile) {
    return null
  }

  const hookModule = await import(hooksfile);

  return hookModule.default;
}