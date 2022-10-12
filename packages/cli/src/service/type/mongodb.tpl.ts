import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

export const template = ({
  className,
  upperName,
  schema,
  fileName,
  kebabPath,
  relative
}: ServiceGeneratorContext) => /* ts */ `import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from \'@feathersjs/mongodb\'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from \'@feathersjs/mongodb\'

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
export class ${className}<ServiceParams extends Params = ${upperName}Params>
  extends MongoDBService<${upperName}, ${upperName}Data, ServiceParams> {
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('${kebabPath}'))
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
