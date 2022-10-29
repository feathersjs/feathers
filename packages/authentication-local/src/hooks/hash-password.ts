import get from 'lodash/get'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'
import { BadRequest } from '@feathersjs/errors'
import { createDebug } from '@feathersjs/commons'
import { HookContext, NextFunction } from '@feathersjs/feathers'
import { LocalStrategy } from '../strategy'

const debug = createDebug('@feathersjs/authentication-local/hooks/hash-password')

export interface HashPasswordOptions {
  authentication?: string
  strategy?: string
}

/**
 * @deprecated Use Feathers schema resolvers and the `passwordHash` resolver instead
 * @param field
 * @param options
 * @returns
 * @see https://dove.feathersjs.com/api/authentication/local.html#passwordhash
 */
export default function hashPassword(field: string, options: HashPasswordOptions = {}) {
  if (!field) {
    throw new Error('The hashPassword hook requires a field name option')
  }

  return async (context: HookContext, next?: NextFunction) => {
    const { app, data, params } = context

    if (data !== undefined) {
      const authService = app.defaultAuthentication(options.authentication)
      const { strategy = 'local' } = options

      if (!authService || typeof authService.getStrategies !== 'function') {
        throw new BadRequest('Could not find an authentication service to hash password')
      }

      const [localStrategy] = authService.getStrategies(strategy) as LocalStrategy[]

      if (!localStrategy || typeof localStrategy.hashPassword !== 'function') {
        throw new BadRequest(`Could not find '${strategy}' strategy to hash password`)
      }

      const addHashedPassword = async (data: any) => {
        const password = get(data, field)

        if (password === undefined) {
          debug(`hook.data.${field} is undefined, not hashing password`)
          return data
        }

        const hashedPassword: string = await localStrategy.hashPassword(password, params)

        return set(cloneDeep(data), field, hashedPassword)
      }

      context.data = Array.isArray(data)
        ? await Promise.all(data.map(addHashedPassword))
        : await addHashedPassword(data)
    }

    if (typeof next === 'function') {
      return next()
    }
  }
}
