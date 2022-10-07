import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const migrationTemplate = ({
  kebabName
}: ServiceGeneratorContext) => /* ts */ `import type { Knex } from 'knex'

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

export const template = ({
  className,
  upperName,
  kebabName,
  feathers,
  schema,
  fileName,
  relative
}: ServiceGeneratorContext) => /* ts */ `import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import type { Application } from '${relative}/declarations'
${
  schema
    ? `import type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query
} from './${fileName}.schema'
`
    : `
export type ${upperName} = any
export type ${upperName}Data = any
export type ${upperName}Query = any
`
}

export interface ${upperName}Params extends KnexAdapterParams<${upperName}Query> {
}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ${className} extends KnexService<${upperName}, ${upperName}Data, ${upperName}Params> {
}

export const getOptions = (app: Application) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('${feathers.database}Client'),
    name: '${kebabName}'
  }
}
`

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<ServiceGeneratorContext>(({ lib, folder, fileName }) => [
          lib,
          'services',
          ...folder,
          `${fileName}.class`
        ])
      )
    )
    .then(
      renderSource(
        migrationTemplate,
        toFile<ServiceGeneratorContext>('migrations', ({ kebabName }) => {
          // Probably not great but it works to align with the Knex migration file format
          const migrationDate = new Date().toISOString().replace(/\D/g, '').substring(0, 14)

          return `${migrationDate}_${kebabName}`
        })
      )
    )
