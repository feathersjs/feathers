import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const template = ({
  language
}: AppGeneratorContext) => /* ts */ `import type { RealTimeConnection, Params } from '@feathersjs/feathers'
import '@feathersjs/transport-commons'
import type { Application, HookContext } from './declarations'
import { logger } from './logger'

export const channels = (app: Application) => {
  if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  logger.warn('Publishing all events to all authenticated users. See \`channels.${language}\` and https://docs.feathersjs.com/api/channels.html for more information.')

  app.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection)
  })

  app.on('login', (authResult: any, { connection }: Params) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if(connection) {
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection)

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection)
    }
  })

  // eslint-disable-next-line no-unused-vars
  app.publish((data: any, context: HookContext) => {
    // Here you can add event publishers to channels set up in \`channels.js\`
    // To publish only for a specific event use \`app.publish(eventname, () => {})\`

    // e.g. to publish all service events to all authenticated users use
    return app.channel('authenticated')
  })
}
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile<AppGeneratorContext>(({ lib }) => lib, 'channels')
    )
  )
