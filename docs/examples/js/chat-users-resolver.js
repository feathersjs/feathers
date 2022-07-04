import crypto from 'crypto'
import { resolve } from '@feathersjs/schema'
import { passwordHash } from '@feathersjs/authentication-local'
import {
  usersDataSchema,
  usersPatchSchema,
  usersResultSchema,
  usersQuerySchema
} from '../schemas/users.schema.js'

// Resolver for the basic data model (e.g. creating new entries)
export const usersDataResolver = resolve({
  schema: usersDataSchema,
  validate: 'before',
  properties: {
    password: passwordHash({ strategy: 'local' }),
    avatar: async (_value, user) => {
      // Gravatar uses MD5 hashes from an email address to get the image
      const hash = crypto
        .createHash('md5')
        .update(user.email.toLowerCase())
        .digest('hex')
      // Return the full avatar URL
      return `https://s.gravatar.com/avatar/${hash}?s=60`
    }
  }
})

// Resolver for making partial updates
export const usersPatchResolver = resolve({
  schema: usersPatchSchema,
  validate: 'before',
  properties: {}
})

// Resolver for the data that is being returned
export const usersResultResolver = resolve({
  schema: usersResultSchema,
  validate: false,
  properties: {}
})

// Resolver for the "safe" version that external clients are allowed to see
export const usersDispatchResolver = resolve({
  schema: usersResultSchema,
  validate: false,
  properties: {
    // The password should never be visible externally
    password: async () => undefined
  }
})

// Resolver for allowed query properties
export const usersQueryResolver = resolve({
  schema: usersQuerySchema,
  validate: 'before',
  properties: {
    // If there is a user (e.g. with authentication)
    // They are only allowed to see their own data
    id: async (value, user, context) => {
      if (context.params.user) {
        return context.params.user.id
      }

      return value
    }
  }
})

// Export all resolvers in a format that can be used with the resolveAll hook
export const usersResolvers = {
  result: usersResultResolver,
  dispatch: usersDispatchResolver,
  data: {
    create: usersDataResolver,
    update: usersDataResolver,
    patch: usersPatchResolver
  },
  query: usersQueryResolver
}
