import { generator, inject, toFile, before, after, prepend } from '@feathershq/pinion'
import { getSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

export const importTemplate = `import { MongoDBService } from \'@feathersjs/mongodb\'
import type { MongoDBAdapterParams } from \'@feathersjs/mongodb\'`

export const classCode = ({ className, upperName }: ServiceGeneratorContext) =>
  `export interface ${upperName}Params extends MongoDBAdapterParams<${upperName}Query> {
}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ${className} extends MongoDBService<${upperName}Result, ${upperName}Data, ${upperName}Params> {
}
`

const optionTemplate = ({ kebabName }: ServiceGeneratorContext) =>
  `    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('${kebabName}'))`

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
