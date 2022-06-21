import { generator, inject, toFile, after, before, prepend } from '@feathershq/pinion'
import { getSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

export const template = ({ className, upperName }: ServiceGeneratorContext) =>
  `export interface ${className}Options {
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
      id: \`\${id}\`,
      text: \`A new message with ID: \${id}!\`
    };
  }

  async create (data: ${upperName}Data, params?: ${upperName}Params): Promise<${upperName}Result>
  async create (data: ${upperName}Data[], params?: ${upperName}Params): Promise<${upperName}Result[]>
  async create (data: ${upperName}Data|${upperName}Data[], params?: ${upperName}Params): Promise<${upperName}Result|${upperName}Result[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return {
      id: 'created',
      ...data
    };
  }

  async update (id: NullableId, data: ${upperName}Data, _params?: ${upperName}Params): Promise<${upperName}Result> {
    return {
      id: \`\${id}\`,
      ...data
    };
  }

  async patch (id: NullableId, data: ${upperName}Data, _params?: ${upperName}Params): Promise<${upperName}Result> {
    return {
      id: \`\${id}\`,
      ...data
    };
  }

  async remove (id: NullableId, _params?: ${upperName}Params): Promise<${upperName}Result> {
    return {
      id: \`\${id}\`,
      text: 'removed'
    };
  }
}
`

export const importTemplate = "import type { Id, NullableId, Params } from '@feathersjs/feathers'"

const optionTemplate = ({}: ServiceGeneratorContext) => `    app`

const toServiceFile = toFile<ServiceGeneratorContext>(({ lib, language, folder, fileName }) => [
  lib,
  'services',
  ...folder,
  `${fileName}.${language}`
])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(inject(getSource(template), before<ServiceGeneratorContext>('export const hooks ='), toServiceFile))
    .then(inject(getSource(importTemplate), prepend(), toServiceFile))
    .then(inject(optionTemplate, after('const options ='), toServiceFile))
