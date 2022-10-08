import { generator, inject, toFile, when, after, before } from '@feathershq/pinion'
import { injectSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const schemaImports = ({
  upperName,
  folder,
  fileName,
  className,
  camelName
}: ServiceGeneratorContext) => /* ts */ `import type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query,
  ${className}
} from './services/${folder.join('/')}/${fileName}'
export type {
  ${upperName},
  ${upperName}Data,
  ${upperName}Query,
}
// export const ${camelName}ServiceMethods = []
`

const declarationTemplate = ({ path, upperName }: ServiceGeneratorContext) =>
  `  '${path}': ClientService<
    ${upperName},
    ${upperName}Data,
    Partial<${upperName}Data>,
    Paginated<${upperName}>, 
    Params<${upperName}Query>
  > & {
    // Add custom methods here
  }`

const registrationTemplate = ({
  path
}: ServiceGeneratorContext) => `  client.use('${path}', connection.service('${path}'), {
  // List all standard and custom methods
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove']
})
`

const toClientFile = toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client.ts'])

export const generate = async (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(
      injectSource(
        registrationTemplate,
        before('return client'),
        toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client'])
      )
    )
    .then(
      when(
        (ctx) => ctx.language === 'ts',
        inject(schemaImports, after("from '@feathersjs/feathers'"), toClientFile),
        inject(declarationTemplate, after('export interface ServiceTypes'), toClientFile)
      )
    )
