import path from 'path'
import fs from 'fs-extra'
import { red } from 'picocolors'
import createResult from './result'

import type { ActionResult, RunnerConfig, RenderedAction } from '../types'

const add = async (
  action: RenderedAction,
  args: any,
  { logger, cwd, createPrompter }: RunnerConfig
): Promise<ActionResult> => {
  const {
    attributes: { to, inject, unlessExists, force, from }
  } = action
  const result = createResult('add', to)
  const prompter = createPrompter<any, any>()
  if (!to || inject) {
    return result('ignored')
  }
  const absTo = path.resolve(cwd, to)
  const shouldNotOverwrite = !force &&
    unlessExists !== undefined && unlessExists === true
  const fileExists = (fs.existsSync(absTo))

  if (shouldNotOverwrite && fileExists) {
    logger.warn(`     skipped: ${to}`)
    return result('skipped')
  }
  if (!process.env.HYGEN_OVERWRITE && fileExists && !force) {
    if (
      !(await prompter
        .prompt({
          prefix: '',
          type: 'confirm',
          name: 'overwrite',
          message: red(`     exists: ${to}. Overwrite? (y/N): `)
        })
        .then(({ overwrite }) => overwrite))
    ) {
      logger.warn(`     skipped: ${to}`)
      return result('skipped')
    }
  }


  if (from) {
    const from_path = path.join(args.templates, from)
    const file = fs.readFileSync(from_path).toString()
    action.body = file
  }

  if (!args.dry) {
    await fs.ensureDir(path.dirname(absTo))
    await fs.writeFile(absTo, action.body)
  }
  const pathToLog = process.env.HYGEN_OUTPUT_ABS_PATH ? absTo : to
  logger.ok(`       ${force ? 'FORCED' : 'added'}: ${pathToLog}`)

  return result('added')
}

export default add