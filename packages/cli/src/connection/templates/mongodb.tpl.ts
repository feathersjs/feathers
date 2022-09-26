import { generator, toFile, before } from '@feathershq/pinion'
import { ConnectionGeneratorContext } from '../index'
import { injectSource, renderSource } from '../../commons'

const template = ({}: ConnectionGeneratorContext) => /* ts */ `import { MongoClient } from 'mongodb'
import type { Db } from 'mongodb'
import type { Application } from './declarations'

declare module './declarations' {
  interface Configuration {
    mongodbClient: Promise<Db>
  }
}

export const mongodb = (app: Application) => {
  const connection = app.get('mongodb') as string
  const database = connection.substring(connection.lastIndexOf('/') + 1)
  const mongoClient = MongoClient.connect(connection)
    .then(client => client.db(database))

  app.set('mongodbClient', mongoClient)
}
`

const configurationTemplate = ({ database }: ConnectionGeneratorContext) =>
  `   ${database}: { type: 'string' },`
const importTemplate = "import { mongodb } from './mongodb'"
const configureTemplate = 'app.configure(mongodb)'
const toAppFile = toFile<ConnectionGeneratorContext>(({ lib }) => [lib, 'app'])

export const generate = (ctx: ConnectionGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<ConnectionGeneratorContext>(({ lib }) => lib, 'mongodb')
      )
    )
    .then(
      injectSource(
        configurationTemplate,
        before('authentication: authenticationSettingsSchema'),
        toFile<ConnectionGeneratorContext>(({ lib }) => [lib, 'configuration']),
        false
      )
    )
    .then(injectSource(importTemplate, before('import { services } from'), toAppFile))
    .then(injectSource(configureTemplate, before('app.configure(services)'), toAppFile))
