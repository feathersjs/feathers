import { HookContext, NextFunction } from '@feathersjs/feathers'
import { BadRequest } from '../../../errors/lib'
import { Schema } from '../schema'

export const validateQuery =
  <H extends HookContext>(schema: Schema<any>) =>
  async (context: H, next?: NextFunction) => {
    const data = context?.params?.query || {}

    try {
      const query = await schema.validate(data)

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

export const validateData =
  <H extends HookContext>(schema: Schema<any>) =>
  async (context: H, next?: NextFunction) => {
    const data = context.data

    try {
      if (Array.isArray(data)) {
        context.data = await Promise.all(data.map((current) => schema.validate(current)))
      } else {
        context.data = await schema.validate(data)
      }
    } catch (error: any) {
      throw error.ajv ? new BadRequest(error.message, error.errors) : error
    }

    if (typeof next === 'function') {
      return next()
    }
  }
