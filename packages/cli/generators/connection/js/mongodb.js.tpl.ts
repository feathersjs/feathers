import { generator, toFile, renderTemplate, inject, before } from '@feathershq/pinion'
import { AppGeneratorContext } from '../../app'

const template = ({}: AppGeneratorContext) =>
`import { MongoClient } from 'mongodb'

export const mongodb = (app) => {
  const connection = app.get('mongodb');
  const database = connection.substr(connection.lastIndexOf('/') + 1);
  const mongoClient = MongoClient.connect(connection)
    .then(client => client.db(database));

  app.set('mongoClient', mongoClient);
};
`

const importTemplate = 'import { mongodb } from \'./mongodb.js\''
const configureTemplate = 'app.configure(mongodb)'
const toAppFile = toFile<AppGeneratorContext>(({ lib }) => lib, 'app.js')

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile<AppGeneratorContext>(({ lib }) => lib, 'mongodb.js')))
  .then(inject(importTemplate, before('import { services } from'), toAppFile))
  .then(inject(configureTemplate, before('app.configure(services)'), toAppFile))
