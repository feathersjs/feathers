import { generator, toFile, renderTemplate, inject, before } from '@feathershq/pinion'
import { AppGeneratorContext } from '../../app'

const template = ({}: AppGeneratorContext) =>
`import { MongoClient, Db } from 'mongodb'
import { Application } from './declarations'

declare module './declarations' {
  interface Configuration {
    mongoClient: Promise<Db>
  }
}

export const mongodb = (app: Application) => {
  const connection = app.get('database');
  const database = connection.substring(connection.lastIndexOf('/') + 1);
  const mongoClient = MongoClient.connect(connection)
    .then(client => client.db(database));

  app.set('mongoClient', mongoClient);
};
`

const importTemplate = 'import { mongodb } from \'./mongodb\''
const configureTemplate = '  app.configure(mongodb)'
const toAppFile = toFile<AppGeneratorContext>(({ lib }) => lib, 'app.ts')

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile<AppGeneratorContext>(({ lib }) => lib, 'mongodb.ts')))
  .then(inject(importTemplate, before('import services from'), toAppFile))
  .then(inject(configureTemplate, before('app.configure(services)'), toAppFile))
