import { Application, ApplicationHookContext, NextFunction } from '@feathersjs/feathers'
import { createDebug } from '@feathersjs/commons'
import { Schema } from '@feathersjs/schema'
import config from 'config'

const debug = createDebug('@feathersjs/configuration')

export = function init(schema?: Schema<any>) {
  return (app?: Application) => {
    if (!app) {
      return config
    }

    const configuration: { [key: string]: unknown } = { ...config }

    debug(`Initializing configuration for ${config.util.getEnv('NODE_ENV')} environment`)

    Object.keys(configuration).forEach((name) => {
      const value = configuration[name]
      debug(`Setting ${name} configuration value to`, value)
      app.set(name, value)
    })

    if (schema) {
      app.hooks({
        setup: [
          async (_context: ApplicationHookContext, next: NextFunction) => {
            await schema.validate(configuration)
            await next()
          }
        ]
      })
    }

    return config
  }
}
