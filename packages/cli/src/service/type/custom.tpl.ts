import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

export const template = ({ className, upperName, schema, fileName, relative }: ServiceGeneratorContext) => `
import type { Id, NullableId, Params } from '@feathersjs/feathers'

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

export interface ${className}Options {
  app: Application
}

export interface ${upperName}Params extends Params<${upperName}Query> {

}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ${className} {
  constructor (public options: ${className}Options) {
  }

  async find (_params?: ${upperName}Params): Promise<${upperName}[]> {
    return []
  }

  async get (id: Id, _params?: ${upperName}Params): Promise<${upperName}> {
    return {
      id: 0,
      text: \`A new message with ID: \${id}!\`
    }
  }

  async create (data: ${upperName}Data, params?: ${upperName}Params): Promise<${upperName}>
  async create (data: ${upperName}Data[], params?: ${upperName}Params): Promise<${upperName}[]>
  async create (data: ${upperName}Data|${upperName}Data[], params?: ${upperName}Params): Promise<${upperName}|${upperName}[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return {
      id: 0,
      ...data
    }
  }

  async update (id: NullableId, data: ${upperName}Data, _params?: ${upperName}Params): Promise<${upperName}> {
    return {
      id: 0,
      ...data
    }
  }

  async patch (id: NullableId, data: ${upperName}Data, _params?: ${upperName}Params): Promise<${upperName}> {
    return {
      id: 0,
      ...data
    }
  }

  async remove (id: NullableId, _params?: ${upperName}Params): Promise<${upperName}> {
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
