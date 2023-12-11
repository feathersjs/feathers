import { generator, toFile, before, prepend, append } from '@feathershq/pinion'
import { ConnectionGeneratorContext } from '../index'
import { injectSource, renderSource } from '../../commons'

const template = ({
  database
}: ConnectionGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { MongoClient } from 'mongodb'
import type { Db } from 'mongodb'
import type { Application } from './declarations'

declare module './declarations' {
  interface Configuration {
    ${database}Client: Promise<Db>
  }
}

export const ${database} = (app: Application) => {
  const connection = app.get('${database}') as string
  const database = new URL(connection).pathname.substring(1)
  const mongoClient = MongoClient.connect(connection)
    .then(client => client.db(database))

  app.set('${database}Client', mongoClient)
}
`

const keywordImport = `import { keywordObjectId } from '@feathersjs/mongodb'`

const keywordTemplate = `dataValidator.addKeyword(keywordObjectId)
queryValidator.addKeyword(keywordObjectId)`

const importTemplate = ({ database }: ConnectionGeneratorContext) =>
  `import { ${database} } from './${database}'`
const configureTemplate = ({ database }: ConnectionGeneratorContext) => `app.configure(${database})`
const toAppFile = toFile<ConnectionGeneratorContext>(({ lib }) => [lib, 'app'])
const toValidatorFile = toFile<ConnectionGeneratorContext>(({ lib }) => [lib, 'validators'])

export const generate = (ctx: ConnectionGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<ConnectionGeneratorContext>(({ lib, database }) => [lib, database])
      )
    )
    .then(injectSource(importTemplate, before('import { services } from'), toAppFile))
    .then(injectSource(configureTemplate, before('app.configure(services)'), toAppFile))
    .then(injectSource(keywordImport, prepend(), toValidatorFile))
    .then(injectSource(keywordTemplate, append(), toValidatorFile))
