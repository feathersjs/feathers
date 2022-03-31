import { schema, resolve, Infer } from '@feathersjs/schema'
import { HookContext } from '../declarations'

// Schema and resolver for the basic data model (e.g. creating new entries)
export const testingDataSchema = schema({
  $id: 'TestingServiceData',
  type: 'object',
  additionalProperties: false,
  required: [ 'text' ],
  properties: {
    text: {
      type: 'string'
    }
  }
} as const)

export type TestingServiceData = Infer<typeof testingDataSchema>

export const testingDataResolver = resolve<TestingServiceData, HookContext>({
  schema: testingDataSchema,
  validate: 'before',
  properties: {}
})


// Schema and resolver for making partial updates
export const testingPatchSchema = schema({
  $id: 'TestingServicePatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...testingDataSchema.definition.properties
  }
} as const)

export type TestingServicePatch = Infer<typeof testingPatchSchema>

export const testingPatchResolver = resolve<TestingServicePatch, HookContext>({
  schema: testingPatchSchema,
  validate: 'before',
  properties: {}
})


// Schema and resolver for the data that is being returned
export const testingResultSchema = schema({
  $id: 'TestingServiceResult',
  type: 'object',
  additionalProperties: false,
  required: [ 'text', 'id' ],
  properties: {
    ...testingDataSchema.definition.properties,
    id: {
      type: 'string'
    }
  }
} as const)

export type TestingServiceResult = Infer<typeof testingResultSchema>

export const testingResultResolver = resolve<TestingServiceResult, HookContext>({
  schema: testingResultSchema,
  validate: false,
  properties: {}
})


// Schema and resolver for allowed query properties
export const testingQuerySchema = schema({
  $id: 'testingQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    $limit: {
      type: 'integer',
      minimum: 0,
      maximum: 100
    },
    $skip: {
      type: 'integer',
      minimum: 0
    }
  }
} as const)

export type TestingServiceQuery = Infer<typeof testingQuerySchema>

export const testingQueryResolver = resolve<TestingServiceQuery, HookContext>({
  schema: testingQuerySchema,
  validate: 'before',
  properties: {}
})
