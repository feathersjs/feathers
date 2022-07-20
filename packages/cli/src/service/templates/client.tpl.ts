import { generator, inject, toFile, when, after } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const schemaImports = ({ upperName, folder, fileName }: ServiceGeneratorContext) => `import type {
  ${upperName}Data,
  ${upperName}Result,
  ${upperName}Query,
} from './services/${folder.join('/')}/${fileName}.schema'

export * from './services/${folder.join('/')}/${fileName}.schema'`

const declarationTemplate = ({ path, upperName }: ServiceGeneratorContext) =>
  `  '${path}': Service<${upperName}Result, ${upperName}Data, Params<${upperName}Query>>`

const toClientFile = toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client.ts'])

export const generate = async (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    when(
      (ctx) => ctx.language === 'ts',
      inject(schemaImports, after("from '@feathersjs/feathers'"), toClientFile),
      inject(declarationTemplate, after('export interface ServiceTypes'), toClientFile)
    )
  )
