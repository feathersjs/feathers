import { toFile } from '@featherscloud/pinion'
import { renderSource } from '../../commons.js'
import { ServiceGeneratorContext } from '../index.js'

export const template = ({
  className,
  upperName,
  schema,
  fileName,
  kebabPath,
  relative
}: ServiceGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from \'@feathersjs/mongodb\'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from \'@feathersjs/mongodb\'

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

export interface ${upperName}Params extends MongoDBAdapterParams<${upperName}Query> {
}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ${className}<ServiceParams extends Params = ${upperName}Params>
  extends MongoDBService<${upperName}, ${upperName}Data, ${upperName}Params, ${upperName}Patch> {
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then(db => db.collection('${kebabPath}'))
  }
}
`

export const generate = (ctx: ServiceGeneratorContext) =>
  Promise.resolve(ctx).then(
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
