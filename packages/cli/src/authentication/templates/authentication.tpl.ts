import { generator, inject, before, toFile } from '@feathershq/pinion'
import { getSource, renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const template = ({ authStrategies }: AuthenticationGeneratorContext) =>
  `import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { expressOauth } from '@feathersjs/authentication-oauth'
import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  ${authStrategies.includes('local') ? "authentication.register('local', new LocalStrategy())" : ''}

  app.use('authentication', authentication)
  app.configure(expressOauth())
}
`

const importTemplate = "import { authentication } from './authentication'"
const configureTemplate = 'app.configure(authentication)'
const toAppFile = toFile<AuthenticationGeneratorContext>(({ lib, language }) => [lib, `app.${language}`])

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx)
    .then(
      renderSource(
        template,
        toFile<AuthenticationGeneratorContext>(({ lib }) => lib, 'authentication')
      )
    )
    .then(inject(getSource(importTemplate), before('import { services } from'), toAppFile))
    .then(inject(getSource(configureTemplate), before('app.configure(services)'), toAppFile))
