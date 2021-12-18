import resolve from './ops'
import { RunnerConfig, RenderedAction, ActionResult } from './types'

const execute = async (
  renderedActions: RenderedAction[],
  args: any,
  config: RunnerConfig
): Promise<ActionResult[]> => {
  const { logger } = config
  const messages: string[] = []
  const results = []

  for (const action of renderedActions) {
    const { message } = action.attributes
    if (message) {
      messages.push(message)
    }
    const ops = await resolve(action.attributes)
    for (const op of ops) {
      results.push(await op(action, args, config))
    }
  }

  if (messages.length > 0) {
    logger.colorful(`${args.action}:\n${messages.join('\n')}`)
  }

  return results
}

export default execute