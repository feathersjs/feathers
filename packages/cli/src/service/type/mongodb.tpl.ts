import { generator, toFile } from '@feathershq/pinion'
import { joinTemplates, renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'
import { registerService, serviceImportTemplate, serviceRegistrationTemplate } from '../service.tpl'

export const importTemplate = /* ts */ `import { MongoDBService } from \'@feathersjs/mongodb\'
import type { MongoDBAdapterParams } from \'@feathersjs/mongodb\'`

export const serviceTemplate = ({ className, upperName, kebabName }: ServiceGeneratorContext) => /* ts */ `

export interface ${upperName}Params extends MongoDBAdapterParams<${upperName}Query> {
}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ${className} extends MongoDBService<${upperName}, ${upperName}Data, ${upperName}Params> {
}

export const getOptions = (app: Application) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('${kebabName}'))
  }
}
`

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        joinTemplates(importTemplate, serviceImportTemplate, serviceTemplate, serviceRegistrationTemplate),
        toFile<ServiceGeneratorContext>(({ lib, folder, fileName }) => [
          lib,
          'services',
          ...folder,
          `${fileName}.service`
        ])
      )
    )
    .then(registerService)
