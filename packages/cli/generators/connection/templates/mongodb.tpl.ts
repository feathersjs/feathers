import { generator, toFile, inject, before } from '@feathershq/pinion'
import { ConnectionGeneratorContext } from '../index'
import { renderSource } from '../../commons'

const js = ({}: ConnectionGeneratorContext) =>
`import { MongoClient } from 'mongodb'

export const mongodb = (app) => {
  const connection = app.get('database')
  const database = connection.substring(connection.lastIndexOf('/') + 1)
  const mongoClient = MongoClient.connect(connection).then((client) => client.db(database))

  app.set('mongoClient', mongoClient)
}`

const ts = ({}: ConnectionGeneratorContext) =>
`import { MongoClient, Db } from 'mongodb'
import { Application } from './declarations'

declare module './declarations' {
  interface Configuration {
    mongoClient: Promise<Db>
  }
}

export const mongodb = (app: Application) => {
  const connection = app.get('database')
  const database = connection.substring(connection.lastIndexOf('/') + 1)
  const mongoClient = MongoClient.connect(connection)
    .then(client => client.db(database))

  app.set('mongoClient', mongoClient)
}
`

const importTemplate = ({ language }: ConnectionGeneratorContext) => language === 'js'
  ? 'import { mongodb } from \'./mongodb.js\''
  : 'import { mongodb } from \'./mongodb\''
const configureTemplate = 'app.configure(mongodb)'
const toAppFile = toFile<ConnectionGeneratorContext>(({ lib }) => lib, ({language }) => `app.${language}`)

export const generate = (ctx: ConnectionGeneratorContext) => generator(ctx)
  .then(renderSource({ js, ts }, toFile<ConnectionGeneratorContext>(({ lib }) => lib, 'mongodb')))
  .then(inject(importTemplate, before('import { services } from'), toAppFile))
  .then(inject(configureTemplate, before('app.configure(services)'), toAppFile))
