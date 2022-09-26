import { generator, toFile, after, prepend, append } from '@feathershq/pinion'
import { injectSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

export const template = ({
  className,
  upperName,
  relative
}: ServiceGeneratorContext) => /* ts */ `import type { Application } from '${relative}/declarations'
  
export interface ${className}Options {
  app: Application
}

export interface ${upperName}Params extends Params<${upperName}Query> {

}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ${className} {
  constructor (public options: ${className}Options) {
  }

  async find (_params?: ${upperName}Params): Promise<${upperName}Result[]> {
    return []
  }

  async get (id: Id, _params?: ${upperName}Params): Promise<${upperName}Result> {
    return {
      id: 0,
      text: \`A new message with ID: \${id}!\`
    }
  }

  async create (data: ${upperName}Data, params?: ${upperName}Params): Promise<${upperName}Result>
  async create (data: ${upperName}Data[], params?: ${upperName}Params): Promise<${upperName}Result[]>
  async create (data: ${upperName}Data|${upperName}Data[], params?: ${upperName}Params): Promise<${upperName}Result|${upperName}Result[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return {
      id: 0,
      ...data
    }
  }

  async update (id: NullableId, data: ${upperName}Data, _params?: ${upperName}Params): Promise<${upperName}Result> {
    return {
      id: 0,
      ...data
    }
  }

  async patch (id: NullableId, data: ${upperName}Data, _params?: ${upperName}Params): Promise<${upperName}Result> {
    return {
      id: 0,
      ...data
    }
  }

  async remove (id: NullableId, _params?: ${upperName}Params): Promise<${upperName}Result> {
    return {
      id: 0,
      text: 'removed'
    }
  }
}
`

export const importTemplate = "import type { Id, NullableId, Params } from '@feathersjs/feathers'"

const optionTemplate = ({}: ServiceGeneratorContext) => `    app`

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
    .then(injectSource(template, append(), toClassFile))
    .then(injectSource(importTemplate, prepend(), toClassFile))
    .then(injectSource(optionTemplate, after('const options ='), toServiceFile, false))
