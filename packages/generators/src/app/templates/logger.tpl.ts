import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const template =
  ({}: AppGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
import { createLogger, format, transports } from 'winston'

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
export const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: 'info',
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.Console()
  ]
})
`

export const logErrorTemplate = /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
import type { HookContext, NextFunction } from '../declarations'
import { logger } from '../logger'

export const logError = async (context: HookContext, next: NextFunction) => {
  try {
    await next()
  } catch (error: any) {
    logger.error(error.stack)
    
    // Log validation errors
    if (error.data) {
      logger.error('Data: %O', error.data)
    }

    throw error
  }
}
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<AppGeneratorContext>(({ lib }) => lib, 'logger')
      )
    )
    .then(
      renderSource(
        logErrorTemplate,
        toFile<AppGeneratorContext>(({ lib }) => lib, 'hooks', 'log-error')
      )
    )
