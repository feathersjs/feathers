import { resolve } from '@feathersjs/schema'
import {
  messagesDataSchema,
  messagesPatchSchema,
  messagesResultSchema,
  messagesQuerySchema
} from '../schemas/messages.schema.js'

// Resolver for the basic data model (e.g. creating new entries)
export const messagesDataResolver = resolve({
  schema: messagesDataSchema,
  validate: 'before',
  properties: {
    userId: async (_value, _message, context) => {
      // Associate the record with the id of the authenticated user
      // context.params.user._id if you are using MongoDB
      return context.params.user.id
    },
    createdAt: async () => {
      return Date.now()
    }
  }
})

// Resolver for making partial updates
export const messagesPatchResolver = resolve({
  schema: messagesPatchSchema,
  validate: 'before',
  properties: {}
})

// Resolver for the data that is being returned
export const messagesResultResolver = resolve({
  schema: messagesResultSchema,
  validate: false,
  properties: {
    user: async (_value, message, context) => {
      // Associate the user that sent the message
      return context.app.service('users').get(message.userId)
    }
  }
})

// Resolver for query properties
export const messagesQueryResolver = resolve({
  schema: messagesQuerySchema,
  validate: 'before',
  properties: {}
})

// Export all resolvers in a format that can be used with the resolveAll hook
export const messagesResolvers = {
  result: messagesResultResolver,
  data: {
    create: messagesDataResolver,
    update: messagesDataResolver,
    patch: messagesPatchResolver
  },
  query: messagesQueryResolver
}
