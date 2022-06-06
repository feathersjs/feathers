import { generator, inject, toFile, before, after, prepend } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

export const importTemplate = `import { MongoDBAdapterParams, MongoDBService } from \'@feathersjs/mongodb\'`

export const ts = ({ className, upperName }: ServiceGeneratorContext) =>
  `export interface ${upperName}Params extends MongoDBAdapterParams<${upperName}Query> {

}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ${className} extends MongoDBService<${upperName}Result, ${upperName}Data, ${upperName}Params> {

}
`

const optionTemplate = ({ kebabName }: ServiceGeneratorContext) =>
  `    paginate: app.get('paginate'),
    Model: app.get('mongoClient').then(db => db.collection('${kebabName}'))`

const toServiceFile = toFile<ServiceGeneratorContext>(({ lib, folder, kebabName, language }) => [
  lib,
  'services',
  ...folder,
  `${kebabName}.${language}`
])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(inject(ts, before<ServiceGeneratorContext>('export const hooks ='), toServiceFile))
    .then(inject(importTemplate, prepend(), toServiceFile))
    .then(inject(optionTemplate, after('const options ='), toServiceFile))
