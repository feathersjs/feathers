import type { HookContext } from '@feathersjs/feathers'
import hashPassword from './hooks/hash-password.js'
import protect from './hooks/protect.js'
import { LocalStrategy } from './strategy.js'

export const hooks = { hashPassword, protect }
export { LocalStrategy }

/**
 * Returns as property resolver that hashes a given plain text password using a Local
 * authentication strategy.
 *
 * @param options The authentication `service` and `strategy` name
 * @returns
 */
export const passwordHash =
  (options: { service?: string; strategy: string }) =>
  async <H extends HookContext<any, any>>(value: string | undefined, _data: any, context: H) => {
    if (value === undefined) {
      return value
    }

    const { app, params } = context
    const authService = app.defaultAuthentication(options.service)
    const localStrategy = authService.getStrategy(options.strategy) as LocalStrategy

    return localStrategy.hashPassword(value, params)
  }
