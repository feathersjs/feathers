import { HookContext, NextFunction } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'
import { VALIDATED } from '@feathersjs/adapter-commons'
import { Schema, Validator } from '../schema'
import { DataValidatorMap } from '../json-schema'

/**
 * Options for {@link validateQuery}.
 */
export type ValidateQueryOptions = {
  /**
   * When `true` (the default), a successfully validated query marks the query
   * so adapters skip their built-in operator and filter allowlist
   * (`sanitizeQuery`). The schema is then the full allowlist.
   *
   * Set to `false` to still run adapter sanitization after schema validation
   * (defense in depth). Both layers then apply: the schema must accept the
   * query, and the adapter must still allow every `$` operator and filter.
   *
   * @default true
   */
  skipSanitize?: boolean
}

export const validateQuery = <H extends HookContext>(
  schema: Schema<any> | Validator,
  options: ValidateQueryOptions = {}
) => {
  const { skipSanitize = true } = options
  const validator: Validator = typeof schema === 'function' ? schema : schema.validate.bind(schema)

  return async (context: H, next?: NextFunction) => {
    const data = context?.params?.query || {}

    try {
      const query = await validator(data)

      // Marking as VALIDATED tells AdapterBase.sanitizeQuery to skip its allowlist.
      // Opt out with skipSanitize: false to run both layers.
      if (skipSanitize) {
        Object.defineProperty(query, VALIDATED, { value: true })
      }

      context.params = {
        ...context.params,
        query
      }
    } catch (error: any) {
      throw error.ajv ? new BadRequest(error.message, error.errors) : error
    }

    if (typeof next === 'function') {
      return next()
    }
  }
}

export const validateData = <H extends HookContext>(schema: Schema<any> | DataValidatorMap | Validator) => {
  return async (context: H, next?: NextFunction) => {
    const data = context.data
    const validator =
      typeof (schema as Schema<any>).validate === 'function'
        ? (schema as Schema<any>).validate.bind(schema)
        : typeof schema === 'function'
          ? schema
          : (schema as any)[context.method]

    if (validator) {
      try {
        if (Array.isArray(data)) {
          context.data = await Promise.all(data.map((current) => validator(current)))
        } else {
          context.data = await validator(data)
        }

        Object.defineProperty(context.data, VALIDATED, { value: true })
      } catch (error: any) {
        throw error.ajv ? new BadRequest(error.message, error.errors) : error
      }
    }

    if (typeof next === 'function') {
      return next()
    }
  }
}
