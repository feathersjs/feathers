import { renderTemplate, toFile } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../commons'

const template =
  ({}: AppGeneratorContext) => /* ts */ `import type { HookContext, NextFunction } from 'feathers'
import { NotAuthenticated } from 'feathers/errors'

// A hook for simple API key authentication. Extend with the functionality needed for your application.
export async function authenticate(context: HookContext, next: NextFunction) {
  if (context.params?.request) {
    const { authorization } = context.params?.request.headers['x-api-key']

    if (authorization !== 'supersecret') {
      throw new NotAuthenticated('Invalid API key')
    }
  }

  await next()
}
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('src', 'hooks', 'authenticate.ts')))
