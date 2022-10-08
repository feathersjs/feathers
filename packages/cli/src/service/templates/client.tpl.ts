import { generator, inject, toFile, when, after, before } from '@feathershq/pinion'
import { injectSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const definitionTemplates = ({
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
  ${upperName}Query
}

const ${camelName}ServiceMethods = ['find', 'get', 'create', 'update', 'patch', 'remove'] as const
type ${upperName}ServiceMethods = typeof ${camelName}ServiceMethods[number]
`

const declarationTemplate = ({ path, className, upperName }: ServiceGeneratorContext) =>
  `  '${path}': Pick<${className}, ${upperName}ServiceMethods>`

const registrationTemplate = ({
  camelName,
  path
}: ServiceGeneratorContext) => `  client.use('${path}', connection.service('${path}'), {
  // List all standard and custom methods
  methods: ${camelName}ServiceMethods
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
        inject(definitionTemplates, after("from '@feathersjs/feathers'"), toClientFile),
        inject(declarationTemplate, after('export interface ServiceTypes'), toClientFile)
      )
    )
