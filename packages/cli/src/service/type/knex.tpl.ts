import { generator, toFile } from '@feathershq/pinion'
import { joinTemplates, renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'
import { registerService, serviceImportTemplate, serviceRegistrationTemplate } from '../service.tpl'

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

export const importTemplate = `import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'
`

export const serviceTemplate = ({
  className,
  upperName,
  kebabName,
  feathers
}: ServiceGeneratorContext) => /* ts */ `

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
        joinTemplates(importTemplate, serviceImportTemplate, serviceTemplate, serviceRegistrationTemplate),
        toFile(
          toFile<ServiceGeneratorContext>(({ lib, folder, fileName }) => [
            lib,
            'services',
            ...folder,
            `${fileName}.service`
          ])
        )
      )
    )
    .then(registerService)
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
