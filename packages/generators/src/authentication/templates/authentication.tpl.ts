import { before, toFile } from '@featherscloud/pinion'
import { injectSource, renderSource } from '../../commons.js'
import { AuthenticationGeneratorContext } from '../index.js'
import { localTemplate, oauthTemplate } from '../../commons.js'

const template = ({
  authStrategies
}: AuthenticationGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
${localTemplate(authStrategies, `import { LocalStrategy } from '@feathersjs/authentication-local'`)}
${oauthTemplate(authStrategies, `import { oauth, OAuthStrategy } from '@feathersjs/authentication-oauth'`)}

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

  app.use('authentication', authentication)
  ${oauthTemplate(authStrategies, `app.configure(oauth())`)}
}
`

const importTemplate = "import { authentication } from './authentication'"
const configureTemplate = 'app.configure(authentication)'
const toAppFile = toFile<AuthenticationGeneratorContext>(({ lib }) => [lib, 'app'])

export const generate = (ctx: AuthenticationGeneratorContext) =>
  Promise.resolve(ctx)
    .then(
      renderSource(
        template,
        toFile<AuthenticationGeneratorContext>(({ lib }) => lib, 'authentication')
      )
    )
    .then(injectSource(importTemplate, before('import { services } from'), toAppFile))
    .then(injectSource(configureTemplate, before('app.configure(services)'), toAppFile))
