import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

export const template = ({
  className,
  upperName,
  kebabName,
  schema,
  fileName,
  relative
}: ServiceGeneratorContext) => /* ts */ `import { MongoDBService } from \'@feathersjs/mongodb\'
import type { MongoDBAdapterParams } from \'@feathersjs/mongodb\'

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
  generator(ctx).then(
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
