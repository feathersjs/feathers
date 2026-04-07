import { renderTemplate, toFile } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../commons'

const template =
  ({}: AppGeneratorContext) => /* ts */ `import type { HookContext, NextFunction } from 'feathers'
import { NotAuthenticated } from 'feathers/errors'

// A hook for simple API key authentication. Extend with the functionality needed for your application.
export async function authenticate(context: HookContext, next: NextFunction) {
  if (context.params?.request) {
    const apiKey = context.params?.request.headers.get('x-api-key')

    if (apiKey !== 'supersecret') {
      throw new NotAuthenticated('Invalid API key')
    }

    context.params = {
      ...context.params,
      user: {
        apiKey: true
      }
    }
  }

  await next()
}
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('src', 'hooks', 'authenticate.ts')))
