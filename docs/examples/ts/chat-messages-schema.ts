import { schema, querySyntax } from '@feathersjs/schema'
import type { Infer } from '@feathersjs/schema'
import { UsersResult } from './users.schema'

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
} as const)

export type MessagesData = Infer<typeof messagesDataSchema>

// Schema for making partial updates
export const messagesPatchSchema = schema({
  $id: 'MessagesPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...messagesDataSchema.properties
  }
} as const)

export type MessagesPatch = Infer<typeof messagesPatchSchema>

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
} as const)

export type MessagesResult = Infer<typeof messagesResultSchema> & {
  user: UsersResult
}

// Schema for allowed query properties
export const messagesQuerySchema = schema({
  $id: 'MessagesQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(messagesResultSchema.properties)
  }
} as const)

export type MessagesQuery = Infer<typeof messagesQuerySchema>
