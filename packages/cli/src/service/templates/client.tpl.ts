import { generator, inject, toFile, when, after } from '@feathershq/pinion'
import { ServiceGeneratorContext } from '../index'

const schemaImports = ({ upperName, folder, fileName }: ServiceGeneratorContext) => /* ts */ `import type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query,
} from './services/${folder.join('/')}/${fileName}.schema'

export type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query,
}`

const declarationTemplate = ({ path, upperName }: ServiceGeneratorContext) =>
  `  '${path}': ClientService<
    ${upperName},
    ${upperName}Data,
    Partial<${upperName}Data>,
    Paginated<${upperName}>, 
    Params<${upperName}Query>
  >`

const toClientFile = toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client.ts'])

export const generate = async (ctx: ServiceGeneratorContext) =>
  generator(ctx).then(
    when(
      (ctx) => ctx.language === 'ts',
      inject(schemaImports, after("from '@feathersjs/feathers'"), toClientFile),
      inject(declarationTemplate, after('export interface ServiceTypes'), toClientFile)
    )
  )
