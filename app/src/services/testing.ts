import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../declarations'
import { resolveData, resolveQuery, resolveResult } from '@feathersjs/schema'

import {
  TestingServiceData,
  TestingServiceResult,
  testingQueryResolver,
  testingDataResolver,
  testingPatchResolver,
  testingResultResolver
} from '../schemas/testing.schema.js'

// The TestingService service class
export interface TestingServiceOptions {
  app: Application
}

export class TestingService implements Partial<ServiceMethods<TestingServiceResult, TestingServiceData>> {
  constructor (public options: TestingServiceOptions) {
  }

  async find (params?: Params) {
    return [];
  }

  async get (id: string, params?: Params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data: TestingServiceData, params?: Params) {
    return { id: 'hi', ...data };
  }

  async update (id: string, data: TestingServiceData, params?: Params) {
    return { id, ...data };
  }

  async patch (id: string, data: TestingServiceData, params?: Params) {
    return { id, ...data };
  }

  async remove (id: string, params?: Params) {
    return { id, text: '' };
  }
}


export const serviceHooks = [
  resolveResult<TestingServiceResult>(testingResultResolver),
  resolveQuery(testingQueryResolver)
]

export const methodHooks = {
  find: [],
  get: [],
  create: [
    resolveData(testingDataResolver)
  ],
  update: [
    resolveData(testingDataResolver)
  ],
  patch: [
    resolveData(testingPatchResolver)
  ],
  remove: []
}

export const regularHooks = {
  before: {},
  after: {},
  error: {}
}

// A configure function that registers the service and its hooks via `app.configure`
export function testing (app) {
  const options = {
    paginate: app.get('paginate'),
    app
  }

  app.use('testing', new TestingService(options))
  app.service('testing').hooks(serviceHooks)
  app.service('testing').hooks(methodHooks)
  app.service('testing').hooks(regularHooks)
}
