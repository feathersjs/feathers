import { schema, querySyntax } from '@feathersjs/schema'
import { UsersResult } from './users.schema.js'

// Schema for the basic data model (e.g. creating new entries)
export const messagesDataSchema = schema({
  $id: 'MessagesData',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: {
      type: 'string'
    },
    createdAt: {
      type: 'number'
    },
    userId: {
      type: 'number' // 'string' if you are using MongoDB
    }
  }
})

// Schema for making partial updates
export const messagesPatchSchema = schema({
  $id: 'MessagesPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...messagesDataSchema.properties
  }
})

// Schema for the data that is being returned
export const messagesResultSchema = schema({
  $id: 'MessagesResult',
  type: 'object',
  additionalProperties: false,
  required: [...messagesDataSchema.required, 'id', 'userId'],
  properties: {
    ...messagesDataSchema.properties,
    id: {
      type: 'string'
    }
  }
})

// Schema for allowed query properties
export const messagesQuerySchema = schema({
  $id: 'MessagesQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(messagesResultSchema.properties)
  }
})
