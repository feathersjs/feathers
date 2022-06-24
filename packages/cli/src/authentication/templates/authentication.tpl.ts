import { generator, before, toFile } from '@feathershq/pinion'
import { injectSource, renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const template = ({ authStrategies, feathers }: AuthenticationGeneratorContext) =>
  `import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { OAuthStrategy } from '@feathersjs/authentication-oauth'
${feathers.framework === 'express' ? `import { expressOauth } from '@feathersjs/authentication-oauth'` : ''}
import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  ${authStrategies
    .map(
      (strategy) =>
        `  authentication.register('${strategy}', ${
          strategy === 'local' ? `new LocalStrategy()` : `new OAuthStrategy()`
        })`
    )
    .join('\n')}

  app.use('authentication', authentication)${
    feathers.framework === 'express'
      ? `
  app.configure(expressOauth())`
      : ''
  }
}
`

const importTemplate = "import { authentication } from './authentication'"
const configureTemplate = 'app.configure(authentication)'
const toAppFile = toFile<AuthenticationGeneratorContext>(({ lib }) => [lib, 'app'])

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<AuthenticationGeneratorContext>(({ lib }) => lib, 'authentication')
      )
    )
    .then(injectSource(importTemplate, before('import { services } from'), toAppFile))
    .then(injectSource(configureTemplate, before('app.configure(services)'), toAppFile))
