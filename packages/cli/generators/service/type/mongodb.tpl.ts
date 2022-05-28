import { generator, inject, toFile, after, prepend } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

export const importTemplate = `import { NullableId, Id } from '@feathersjs/feathers'
import { MongoDBAdapterParams, MongoDbAdapter } from \'@feathersjs/mongodb\'
`

export const ts = ({ className, upperName }: ServiceGeneratorContext) =>
  `export interface ${upperName}Params extends MongoDBAdapterParams<${upperName}Query> {

}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ${className} extends MongoDbAdapter<${upperName}Result, ${upperName}Data, ${upperName}Params> {
  async find (params?: ${upperName}Params) {
    return this._find(params)
  }

  async get (id: Id, params?: ${upperName}Params) {
    return this._get(id, params)
  }

  async create (data: ${upperName}Data|${upperName}Data[], params?: ${upperName}Params) {
    return this._create(data, params)
  }

  async update (id: Id, data: ${upperName}Data, params?: ${upperName}Params) {
    return this._update(id, data, params)
  }

  async patch (id: NullableId, data: Partial<${upperName}Data>, params?: ${upperName}Params) {
    return this._patch(id, data, params)
  }

  async remove (id: NullableId, params?: ${upperName}Params) {
    return this._remove(id, params)
  }
}
`

const optionTemplate = ({ kebabName }: ServiceGeneratorContext) =>
  `   paginate: app.get('paginate'),
    Model: app.get('mongoClient').then(db => db.collection('${kebabName}'))`

const toServiceFile = toFile<ServiceGeneratorContext>(({ lib, folder, kebabName }) => [
  lib,
  'services',
  ...folder,
  `${kebabName}.ts`
])

export const generate = (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      inject(
        ts,
        after<ServiceGeneratorContext>(({ className }) => `// The ${className} service class`),
        toServiceFile
      )
    )
    .then(inject(importTemplate, prepend(), toServiceFile))
    .then(inject(optionTemplate, after('const options ='), toServiceFile))
