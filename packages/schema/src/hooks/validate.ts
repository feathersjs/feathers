import { HookContext, NextFunction } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'
import { VALIDATED } from '@feathersjs/adapter-commons'
import { Schema, Validator } from '../schema'
import { DataValidatorMap } from '../json-schema'

export const validateQuery = <H extends HookContext>(schema: Schema<any> | Validator) => {
  const validator: Validator = typeof schema === 'function' ? schema : schema.validate.bind(schema)

  return async (context: H, next?: NextFunction) => {
    const data = context?.params?.query || {}

    try {
      const query = await validator(data)

      Object.defineProperty(query, VALIDATED, { value: true })

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
