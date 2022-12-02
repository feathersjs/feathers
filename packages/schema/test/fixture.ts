import { feathers, HookContext, Application as FeathersApplication } from '@feathersjs/feathers'
import { memory, MemoryService } from '@feathersjs/memory'
import { GeneralError } from '@feathersjs/errors'

import {
  resolve,
  resolveResult,
  resolveQuery,
  resolveData,
  validateData,
  validateQuery,
  querySyntax,
  resolveDispatch,
  resolveAll,
  Ajv,
  FromSchema,
  getValidator,
  getDataValidator
} from '../src'
import { AdapterParams } from '../../memory/node_modules/@feathersjs/adapter-commons/lib'

const fixtureAjv = new Ajv({
  coerceTypes: true,
  addUsedSchema: false
})

export const userDataSchema = {
  $id: 'UserData',
  type: 'object',
  additionalProperties: false,
  required: ['email'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const

export const userDataValidator = getDataValidator(userDataSchema, fixtureAjv)

export type UserData = FromSchema<typeof userDataSchema>

export const userDataResolver = resolve<UserData, HookContext<Application>>({
  properties: {
    password: async () => {
      return 'hashed'
    }
  }
})

export const userSchema = {
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['id', ...userDataSchema.required],
  properties: {
    ...userDataSchema.properties,
    id: { type: 'number' },
    name: { type: 'string' }
  }
} as const

export type User = FromSchema<typeof userSchema>

export const userResolver = resolve<User, HookContext<Application>>({
  properties: {
    name: async (_value, user) => user.email.split('@')[0]
  }
})

export const userExternalResolver = resolve<User, HookContext<Application>>({
  properties: {
    password: async (): Promise<undefined> => undefined,
    email: async () => '[redacted]'
  }
})

export const secondUserResolver = resolve<User, HookContext<Application>>({
  name: async (value, user) => `${value} (${user.email})`
})

export const messageDataSchema = {
  $id: 'MessageData',
  type: 'object',
  additionalProperties: false,
  required: ['text', 'userId'],
  properties: {
    text: { type: 'string' },
    userId: { type: 'number' }
  }
} as const

export type MessageData = FromSchema<typeof messageDataSchema>

export const messageSchema = {
  $id: 'MessageResult',
  type: 'object',
  additionalProperties: false,
  required: ['id', ...messageDataSchema.required],
  properties: {
    ...messageDataSchema.properties,
    id: { type: 'number' },
    user: { $ref: 'User' }
  }
} as const

export type Message = FromSchema<
  typeof messageSchema,
  {
    references: [typeof userSchema]
  }
>

export const messageResolver = resolve<Message, HookContext<Application>>({
  properties: {
    user: async (_value, message, context) => {
      const { userId } = message

      if (context.params.error === true) {
        throw new GeneralError('This is an error')
      }

      const user = await context.app.service('users').get(userId, context.params)

      return user as Message['user']
    }
  }
})

export const messageQuerySchema = {
  $id: 'MessageQuery',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...querySyntax(messageDataSchema.properties),
    $resolve: {
      type: 'array',
      items: { type: 'string' }
    }
  }
} as const

export type MessageQuery = FromSchema<typeof messageQuerySchema>

export const messageQueryValidator = getValidator(messageQuerySchema, fixtureAjv)

export const messageQueryResolver = resolve<MessageQuery, HookContext<Application>>({
  userId: async (value, _query, context) => {
    if (context.params?.user) {
      return context.params.user.id
    }

    return value
  }
})

class MessageService extends MemoryService<Message, MessageData, ServiceParams> {
  async customMethod(data: any) {
    return data
  }
}

const customMethodDataResolver = resolve<any, HookContext<Application>>({
  properties: {
    userId: async () => 0,
    additionalData: async () => 'additional data'
  }
})

interface ServiceParams extends AdapterParams {
  user?: User
  error?: boolean
}

type ServiceTypes = {
  users: MemoryService<User, UserData, ServiceParams>
  messages: MessageService
  paginatedMessages: MemoryService<Message, MessageData, ServiceParams>
}
type Application = FeathersApplication<ServiceTypes>

const app = feathers<ServiceTypes>()

app.use(
  'users',
  memory({
    multi: ['create']
  })
)
app.use('messages', new MessageService(), {
  methods: ['find', 'get', 'create', 'update', 'patch', 'remove', 'customMethod']
})
app.use('paginatedMessages', memory({ paginate: { default: 10 } }))

app.service('messages').hooks({
  around: {
    all: [
      resolveAll({
        result: messageResolver,
        query: messageQueryResolver
      }),
      validateQuery(messageQueryValidator)
    ],
    customMethod: [resolveData(customMethodDataResolver)]
  }
})

app
  .service('paginatedMessages')
  .hooks([
    validateQuery(messageQueryValidator),
    resolveQuery(messageQueryResolver),
    resolveResult(messageResolver)
  ])

app
  .service('users')
  .hooks([resolveDispatch(userExternalResolver), resolveResult(userResolver, secondUserResolver)])

app.service('users').hooks({
  create: [validateData(userDataValidator), resolveData(userDataResolver)]
})

export { app }
