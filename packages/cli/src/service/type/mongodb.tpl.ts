import { generator, toFile, after, prepend, append } from '@feathershq/pinion'
import { injectSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

export const importTemplate = /* ts */ `import { MongoDBService } from \'@feathersjs/mongodb\'
import type { MongoDBAdapterParams } from \'@feathersjs/mongodb\'`

export const classCode = ({
  className,
  upperName
}: ServiceGeneratorContext) => /* ts */ `export interface ${upperName}Params extends MongoDBAdapterParams<${upperName}Query> {
}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ${className} extends MongoDBService<${upperName}Result, ${upperName}Data, ${upperName}Params> {
}
`

const optionTemplate = ({ kebabName }: ServiceGeneratorContext) =>
  `    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('${kebabName}'))`

const toServiceFile = toFile<ServiceGeneratorContext>(({ lib, folder, fileName }) => [
  lib,
  'services',
  ...folder,
  `${fileName}.service`
])

const toClassFile = toFile<ServiceGeneratorContext>(({ lib, folder, fileName }) => [
  lib,
  'services',
  ...folder,
  `${fileName}.class`
])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(injectSource(classCode, append(), toClassFile))
    .then(injectSource(importTemplate, prepend(), toClassFile))
    .then(injectSource(optionTemplate, after('const options ='), toServiceFile, false))
