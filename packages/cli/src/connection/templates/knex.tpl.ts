import { generator, toFile, inject, before, mergeJSON } from '@feathershq/pinion'
import { ConnectionGeneratorContext } from '../index'
import { getSource, renderSource } from '../../commons'

const template = ({ database }: ConnectionGeneratorContext) =>
  `import knex from 'knex'
import type { Knex } from 'knex'
import type { Application } from './declarations'

declare module './declarations' {
  interface Configuration {
    ${database}Client: Knex
  }
}

export const ${database} = (app: Application) => {
  const config = app.get('${database}')
  const db = knex(config!)

  app.set('${database}Client', db);
}
`

const knexfile = ({ lib, language, database }: ConnectionGeneratorContext) => `
import { app } from './${lib}/app'

// Load our database connection info from the app configuration
const config = app.get('${database}')

${language === 'js' ? 'export default config' : 'module.exports = config'}
`

const configurationTemplate = ({ database }: ConnectionGeneratorContext) => `    ${database}: {
    type: 'object',
    properties: {
      client: { type: 'string' },
      connection: { type: 'string' }
    }
  },`

const importTemplate = ({ database }: ConnectionGeneratorContext) =>
  `import { ${database} } from './${database}'`
const configureTemplate = ({ database }: ConnectionGeneratorContext) => `app.configure(${database})`
const toAppFile = toFile<ConnectionGeneratorContext>(({ lib, language }) => [lib, `app.${language}`])

export const generate = (ctx: ConnectionGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<ConnectionGeneratorContext>(({ lib, database }) => [lib, database])
      )
    )
    .then(renderSource(knexfile, toFile('knexfile')))
    .then(
      mergeJSON<ConnectionGeneratorContext>(
        {
          scripts: {
            migrate: `knex migrate:latest`,
            test: 'npm run migrate && npm run mocha'
          }
        },
        toFile('package.json')
      )
    )
    .then(
      inject(
        configurationTemplate,
        before('authentication: authenticationSettingsSchema'),
        toFile<ConnectionGeneratorContext>(({ lib, language }) => [
          lib,
          'schemas',
          `configuration.schema.${language}`
        ])
      )
    )
    .then(inject(getSource(importTemplate), before('import { services } from'), toAppFile))
    .then(inject(getSource(configureTemplate), before('app.configure(services)'), toAppFile))
