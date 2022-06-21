import { generator, inject, toFile, when, after } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const schemaImports = ({ upperName, schemaPath }: ServiceGeneratorContext) => `import type {
  ${upperName}Data,
  ${upperName}Result,
  ${upperName}Query,
} from './${schemaPath}'`
const declarationTemplate = ({ path, upperName }: ServiceGeneratorContext) =>
  `  '${path}': Service<${upperName}Data, ${upperName}Result, Params<${upperName}Query>>`

const toClientFile = toFile<ServiceGeneratorContext>(({ lib, language }) => [lib, `client.${language}`])

export const generate = async (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      when(
        (ctx) => ctx.language === 'ts',
        inject(schemaImports, after("from '@feathersjs/feathers'"), toClientFile)
      )
    )
    .then(
      when(
        (ctx) => ctx.language === 'ts',
        inject(declarationTemplate, after('export interface ServiceTypes'), toClientFile)
      )
    )
