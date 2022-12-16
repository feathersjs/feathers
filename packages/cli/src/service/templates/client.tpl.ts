import { generator, toFile, when, after, before } from '@feathershq/pinion'
import { injectSource } from '../../commons'
import { ServiceGeneratorContext } from '../index'

const importTemplate = ({
  upperName,
  folder,
  fileName,
  className,
  camelName,
  type
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
export const ${camelName}ServiceMethods = ['find', 'get', 'create', 'patch', 'remove'] as const
export type ${upperName}ClientService = Pick<${className}${
  type !== 'custom' ? `<Params<${upperName}Query>>` : ''
}, typeof ${camelName}ServiceMethods[number]>
`

const declarationTemplate = ({ path, upperName }: ServiceGeneratorContext) =>
  `  '${path}': ${upperName}ClientService`

const registrationTemplate = ({
  camelName,
  path
}: ServiceGeneratorContext) => `  client.use('${path}', connection.service('${path}'), {
  methods: ${camelName}ServiceMethods
})`

const toClientFile = toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client'])

export const generate = async (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(injectSource(registrationTemplate, before('return client'), toClientFile))
    .then(
      when(
        (ctx) => ctx.language === 'js',
        injectSource(importTemplate, after('import authenticationClient'), toClientFile)
      )
    )
    .then(
      when(
        (ctx) => ctx.language === 'ts',
        injectSource(importTemplate, after('import type { AuthenticationClientOptions }'), toClientFile),
        injectSource(declarationTemplate, after('export interface ServiceTypes'), toClientFile)
      )
    )
