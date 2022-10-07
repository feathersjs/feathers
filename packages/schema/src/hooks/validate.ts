import { HookContext, NextFunction } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'
import { Schema, Validator } from '../schema'
import { DataValidatorMap } from '../json-schema'

export const validateQuery = <H extends HookContext>(schema: Schema<any> | Validator) => {
  const validator: Validator = typeof schema === 'function' ? schema : schema.validate.bind(schema)

  return async (context: H, next?: NextFunction) => {
    const data = context?.params?.query || {}

    try {
      const query = await validator(data)

      context.params = {
        ...context.params,
        query
      }

      if (typeof next === 'function') {
        return next()
      }
    } catch (error: any) {
      throw error.ajv ? new BadRequest(error.message, error.errors) : error
    }
  }
}

export const validateData = <H extends HookContext>(schema: Schema<any> | DataValidatorMap) => {
  return async (context: H, next?: NextFunction) => {
    const data = context.data
    const validator =
      typeof (schema as Schema<any>).validate === 'function'
        ? (schema as Schema<any>).validate.bind(schema)
        : (schema as any)[context.method]

    if (validator) {
      try {
        if (Array.isArray(data)) {
          context.data = await Promise.all(data.map((current) => validator(current)))
        } else {
          context.data = await validator(data)
        }
      } catch (error: any) {
        throw error.ajv ? new BadRequest(error.message, error.errors) : error
      }
    }

    if (typeof next === 'function') {
      return next()
    }
  }
}
