import { toFile } from '@featherscloud/pinion'
import { renderSource, yyyymmddhhmmss } from '../../commons.js'
import { ServiceGeneratorContext } from '../index.js'

const migrationTemplate = ({
  kebabPath,
  authStrategies,
  isEntityService
}: ServiceGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('${kebabPath}', table => {
    table.increments('id')
    ${
      isEntityService
        ? authStrategies
            .map((name) =>
              name === 'local'
                ? `    
    table.string('email').unique()
    table.string('password')`
                : `    
    table.string('${name}Id')`
            )
            .join('\n')
        : `
    table.string('text')`
    }
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
}: ServiceGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '${relative}/declarations'
${
  schema
    ? `import type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Patch,
  ${upperName}Query
} from './${fileName}.schema'
`
    : `
type ${upperName} = any
type ${upperName}Data = any
type ${upperName}Patch = any
type ${upperName}Query = any
`
}

export type { ${upperName}, ${upperName}Data, ${upperName}Patch, ${upperName}Query }

export interface ${upperName}Params extends KnexAdapterParams<${upperName}Query> {
}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ${className}<ServiceParams extends Params = ${upperName}Params>
  extends KnexService<${upperName}, ${upperName}Data, ${upperName}Params, ${upperName}Patch> {
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
  Promise.resolve(ctx)
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
        toFile<ServiceGeneratorContext>('migrations', ({ kebabName }) => `${yyyymmddhhmmss()}_${kebabName}`)
      )
    )
