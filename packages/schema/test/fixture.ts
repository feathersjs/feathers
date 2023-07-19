import { feathers, HookContext, Application as FeathersApplication } from '@feathersjs/feathers'
import { memory, MemoryService } from '@feathersjs/memory'
import { GeneralError } from '@feathersjs/errors'
import { AdapterParams } from '@feathersjs/adapter-commons'

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
  getDataValidator,
  virtual
} from '../src'

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

export const userDataValidator = getValidator(userDataSchema, fixtureAjv)

export const userDataValidatorMap = getDataValidator(userDataSchema, fixtureAjv)

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
  name: async (_value, user) => user.email.split('@')[0]
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
    user: { $ref: 'User' },
    userList: { type: 'array', items: { $ref: 'User' } },
    userPage: { type: 'object' }
  }
} as const

export type Message = FromSchema<
  typeof messageSchema,
  {
    references: [typeof userSchema]
  }
>

export const messageResolver = resolve<Message, HookContext<Application>>({
  user: virtual(async (message, context) => {
    const { userId } = message

    if (context.params.error === true) {
      throw new GeneralError('This is an error')
    }

    const {
      data: [user]
    } = (await context.app.service('users').find({
      ...context.params,
      paginate: { default: 2 },
      query: {
        id: userId
      }
    })) as any

    return user as Message['user']
  }),
  userList: virtual(async (_message, context) => {
    const users = await context.app.service('users').find({
      paginate: false
    })

    return users.map((user) => user) as any
  }),
  userPage: virtual(async (_message, context) => {
    const users = await context.app.service('users').find({
      adapter: {
        paginate: {
          default: 2
        }
      }
    })

    return users as any
  })
})

export const otherMessageResolver = resolve<{ text: string }, HookContext<Application>>({})

export const messageQuerySchema = {
  $id: 'MessageQuery',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...querySyntax(messageDataSchema.properties),
    $select: {
      type: 'array',
      items: { type: 'string' }
    },
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

interface ServiceParams extends AdapterParams {
  user?: User
  error?: boolean
}

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
    customMethod: [resolveData(customMethodDataResolver)],
    find: [
      async (context, next) => {
        // A hook that makes sure that virtual properties are not passed to the adapter as `$select`
        // An SQL adapter would throw an error if it received a query like this
        if (context.params?.query?.$select && context.params?.query?.$select.includes('user')) {
          throw new Error('Invalid $select')
        }
        await next()
      }
    ]
  }
})

app
  .service('paginatedMessages')
  .hooks([
    resolveDispatch(),
    resolveResult(messageResolver, otherMessageResolver),
    validateQuery(messageQueryValidator),
    resolveQuery(messageQueryResolver)
  ])

app
  .service('users')
  .hooks([resolveDispatch(userExternalResolver), resolveResult(userResolver, secondUserResolver)])

app.service('users').hooks({
  create: [validateData(userDataValidator), validateData(userDataValidatorMap), resolveData(userDataResolver)]
})

export { app }
