import type { Application, ApplicationHookContext, NextFunction } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
import type { Schema, Validator } from '@feathersjs/schema'
import config from 'config'

const debug = createDebug('@feathersjs/configuration')

export default function init(schema?: Schema<any> | Validator) {
  const validator: Validator = typeof schema === 'function' ? schema : schema?.validate.bind(schema)

  return (app?: Application): { [key: string]: unknown } => {
    if (!app) {
      return config as unknown as { [key: string]: unknown }
    }

    const configuration: { [key: string]: unknown } = { ...config }

    debug(`Initializing configuration for ${process.env.NODE_ENV} environment`)

    Object.keys(configuration).forEach((name) => {
      const value = configuration[name]
      debug(`Setting ${name} configuration value to`, value)
      app.set(name, value)
    })

    if (validator) {
      app.hooks({
        setup: [
          async (_context: ApplicationHookContext, next: NextFunction) => {
            await validator(configuration)
            await next()
          }
        ]
      })
    }

    return config as unknown as { [key: string]: unknown }
  }
}
