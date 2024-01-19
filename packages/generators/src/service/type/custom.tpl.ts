import { toFile } from '@featherscloud/pinion'
import { renderSource } from '../../commons.js'
import { ServiceGeneratorContext } from '../index.js'

export const template = ({
  className,
  upperName,
  schema,
  fileName,
  relative
}: ServiceGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

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

export interface ${className}Options {
  app: Application
}

export interface ${upperName}Params extends Params<${upperName}Query> {

}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ${className}<ServiceParams extends ${upperName}Params = ${upperName}Params>
    implements ServiceInterface<${upperName}, ${upperName}Data, ServiceParams, ${upperName}Patch> {
  constructor (public options: ${className}Options) {
  }

  async find (_params?: ServiceParams): Promise<${upperName}[]> {
    return []
  }

  async get (id: Id, _params?: ServiceParams): Promise<${upperName}> {
    return {
      id: 0,
      text: \`A new message with ID: \${id}!\`
    }
  }

  async create (data: ${upperName}Data, params?: ServiceParams): Promise<${upperName}>
  async create (data: ${upperName}Data[], params?: ServiceParams): Promise<${upperName}[]>
  async create (data: ${upperName}Data|${upperName}Data[], params?: ServiceParams): Promise<${upperName}|${upperName}[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return {
      id: 0,
      ...data
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update (id: NullableId, data: ${upperName}Data, _params?: ServiceParams): Promise<${upperName}> {
    return {
      id: 0,
      ...data
    }
  }

  async patch (id: NullableId, data: ${upperName}Patch, _params?: ServiceParams): Promise<${upperName}> {
    return {
      id: 0,
      text: \`Fallback for \${id}\`,
      ...data
    }
  }

  async remove (id: NullableId, _params?: ServiceParams): Promise<${upperName}> {
    return {
      id: 0,
      text: 'removed'
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
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
