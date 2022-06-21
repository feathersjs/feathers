import { generator, inject, toFile, before, after, prepend } from '@feathershq/pinion'
import { getSource, renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const migrationTemplate = ({ kebabName }: ServiceGeneratorContext) => `import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('${kebabName}', table => {
    table.increments('id')
    table.string('text')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('${kebabName}')
}
`

export const importTemplate = `import { KnexService } from \'@feathersjs/knex\'
import type { KnexAdapterParams } from \'@feathersjs/knex\'`

export const classCode = ({ className, upperName }: ServiceGeneratorContext) =>
  `export interface ${upperName}Params extends KnexAdapterParams<${upperName}Query> {
}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ${className} extends KnexService<${upperName}Result, ${upperName}Data, ${upperName}Params> {
}
`

export const optionTemplate = ({ kebabName, feathers }: ServiceGeneratorContext) =>
  `    paginate: app.get('paginate'),
    Model: app.get('${feathers.database}Client'),
    name: '${kebabName}'`

const toServiceFile = toFile<ServiceGeneratorContext>(({ lib, folder, fileName, language }) => [
  lib,
  'services',
  ...folder,
  `${fileName}.${language}`
])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      inject(getSource(classCode), before<ServiceGeneratorContext>('export const hooks ='), toServiceFile)
    )
    .then(inject(getSource(importTemplate), prepend(), toServiceFile))
    .then(inject(optionTemplate, after('const options ='), toServiceFile))
    .then(
      renderSource(
        migrationTemplate,
        toFile<ServiceGeneratorContext>('migrations', ({ kebabName }) => {
          const now = new Date()
          const migrationDate =
            `${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDay()}` +
            `${now.getUTCHours()}${now.getUTCMinutes()}${now.getUTCSeconds()}`

          return `${migrationDate}_${kebabName}`
        })
      )
    )
