import { generator, toFile, after, when } from '@feathershq/pinion'
import { injectSource } from '../../commons'
import { ServiceGeneratorContext } from '../../service'

const importTemplate = /* ts */ `import type { AuthenticationService } from '@feathersjs/authentication'
`
const declarationTemplate = `  authentication: Pick<AuthenticationService, 'create' | 'remove'>`

const toClientFile = toFile<ServiceGeneratorContext>(({ lib }) => [lib, 'client'])

export const generate = async (ctx: ServiceGeneratorContext) =>
  generator(ctx)
    .then(injectSource(importTemplate, after('import authenticationClient'), toClientFile))
    .then(
      when(
        ({ language }) => language === 'ts',
        injectSource(declarationTemplate, after('export interface ServiceTypes'), toClientFile)
      )
    )
