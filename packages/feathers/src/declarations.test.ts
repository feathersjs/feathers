import { describe, it } from 'vitest'
import assert from 'assert'
import { hooks } from '../src/hooks/index.js'
import {
  feathers,
  ServiceInterface,
  Application,
  HookContext,
  NextFunction,
  Id,
  Params
} from '../src/index.js'

interface Todo {
  id: number
  message: string
  completed: boolean
}

interface TodoData {
  message: string
  completed?: boolean
}

class TodoService implements ServiceInterface<Todo, TodoData> {
  constructor(public todos: Todo[] = []) {}

  async find() {
    return this.todos
  }

  async create(data: TodoData) {
    const { completed = false } = data
    const todo: Todo = {
      id: this.todos.length,
      completed,
      message: data.message
    }

    this.todos.push(todo)

    return todo
  }

  async setup(app: Application) {
    assert.ok(app)
  }
}

interface Configuration {
  port: number
}

interface Services {
  todos: TodoService
  v2: Application<Record<string, unknown>, Configuration>
}

type MainApp = Application<Services, Configuration>

const myHook = async (context: HookContext<MainApp>, next: NextFunction) => {
  assert.ok(context.app.service('todos'))
  await next()
}

hooks(TodoService.prototype, [
  async (_ctx: HookContext<MainApp>, next) => {
    await next()
  }
])

hooks(TodoService, {
  create: [myHook]
})

// Service with custom methods for type testing
interface MessageStatus {
  id: string
  status: 'active' | 'archived'
}

class MessageService {
  async find(_params?: Params) {
    return [{ id: '1', text: 'Hello' }]
  }

  async get(id: Id, _params?: Params) {
    return { id: String(id), text: 'Hello' }
  }

  // Custom method with different signature
  async status(id: Id, _params?: Params): Promise<MessageStatus> {
    return { id: String(id), status: 'active' }
  }

  // Custom method with data
  async archive(id: Id, _params?: Params): Promise<{ id: string; archived: boolean }> {
    return { id: String(id), archived: true }
  }
}

interface ServicesWithCustomMethods {
  messages: MessageService
}

describe('Feathers typings', () => {
  it('custom methods are properly typed on services', async () => {
    const app = feathers<ServicesWithCustomMethods>()
    app.use('messages', new MessageService())

    const service = app.service('messages')

    // Standard methods are typed
    const messages = await service.find()
    assert.ok(Array.isArray(messages))

    const message = await service.get('1')
    assert.ok(message.id)
    assert.ok(message.text)

    // Custom methods are typed with correct signatures
    const status: MessageStatus = await service.status('1')
    assert.strictEqual(status.status, 'active')

    const archived = await service.archive('1')
    assert.strictEqual(archived.archived, true)

    // TypeScript ensures correct return types (this is a compile-time check)
    const _statusType: 'active' | 'archived' = status.status
    const _archivedType: boolean = archived.archived
    assert.ok(_statusType)
    assert.ok(typeof _archivedType === 'boolean')
  })

  it('initializes the app with proper types', async () => {
    const app: MainApp = feathers<Services, Configuration>()
    const app2 = feathers<Record<string, unknown>, Configuration>()

    app.set('port', 80)
    app.use('todos', new TodoService(), {
      methods: ['find', 'create']
    })
    app.use('v2', app2)

    const service = app.service('todos')

    service.on('created', (data) => {
      assert.ok(data)
    })

    service.hooks({
      before: {
        all: [],
        create: [
          async (context) => {
            const { result, data, service } = context

            assert.ok(service instanceof TodoService)
            assert.ok(result)
            assert.ok(data)
            assert.ok(context.app.service('todos'))
          }
        ]
      }
    })

    service.hooks({
      create: [
        async (context, next) => {
          assert.ok(context)
          await next()
        },
        async (context, next) => {
          assert.ok(context)
          await next()
        },
        myHook
      ]
    })
  })
})
