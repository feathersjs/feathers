import type { RenderAttributes, ActionResult, RenderedAction, RunnerConfig } from '../types'

export const resolve = async (attributes: RenderAttributes) => {
  const ops = []
  if (attributes.to && !attributes.inject) {
    const add = (await import('./add')).default
    ops.push(add)
  }
  if (attributes.to && attributes.inject) {
    const inject = (await import('./inject')).default
    ops.push(inject)
  }
  if (attributes.sh) {
    const shell = (await import('./shell')).default
    ops.push(shell)
  }
  return ops
}

export const execute = async (
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