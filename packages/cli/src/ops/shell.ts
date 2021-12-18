import { RenderedAction, RunnerConfig } from '..'
import { ActionResult } from '../types'
import createResult from './result'

const notEmpty = (x: string) => x && x.length > 0

const shell = async (
  { attributes: { sh }, body }: RenderedAction,
  args: any,
  { logger, exec }: RunnerConfig
): Promise<ActionResult> => {
  const result = createResult('shell', sh)
  if (notEmpty(sh)) {
    if (!args.dry) {
      try {
        await exec(sh, body)
      } catch (error: any) {
        logger.err(error.stderr)
        process.exit(1)
      }
    }
    logger.ok(`       shell: ${sh}`)

    return result('executed')
  }
  return result('ignored')
}

export default shell