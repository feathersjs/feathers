import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const migrationTemplate = ({
  kebabPath
}: ServiceGeneratorContext) => /* ts */ `import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('${kebabPath}', table => {
    table.increments('id')
    table.string('text')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('${kebabPath}')
}
`

export const template = ({
  className,
  upperName,
  feathers,
  schema,
  fileName,
  relative
}: ServiceGeneratorContext) => /* ts */ `import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

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
export class ${className}<ServiceParams extends Params = ${upperName}Params>
  extends KnexService<${upperName}, ${upperName}Data, ServiceParams> {
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('${feathers.database}Client'),
    name: '${fileName}'
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
