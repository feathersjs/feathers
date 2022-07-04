import { schema, querySyntax } from '@feathersjs/schema'

// Schema for the basic data model (e.g. creating new entries)
export const usersDataSchema = schema({
  $id: 'UsersData',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    avatar: {
      type: 'string'
    }
  }
})

// Schema for making partial updates
export const usersPatchSchema = schema({
  $id: 'UsersPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...usersDataSchema.properties
  }
})

// Schema for the data that is being returned
export const usersResultSchema = schema({
  $id: 'UsersResult',
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    ...usersDataSchema.properties,
    id: {
      type: 'string'
    }
  }
})

// Queries shouldn't allow doing anything with the password
const { password, ...usersQueryProperties } = usersResultSchema.properties

// Schema for allowed query properties
export const usersQuerySchema = schema({
  $id: 'UsersQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(usersQueryProperties)
  }
})
