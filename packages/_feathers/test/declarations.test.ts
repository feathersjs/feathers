import assert from 'assert';
import { hooks } from '@feathersjs/hooks';
import {
  feathers, ServiceInterface, Application, HookContext, NextFunction
} from '../src';

interface Todo {
  id: number;
  message: string;
  completed: boolean;
}

interface TodoData {
  message: string;
  completed?: boolean;
}

class TodoService implements ServiceInterface<Todo, TodoData> {
  constructor (public todos: Todo[] = []) {}

  async find () {
    return this.todos;
  }

  async create (data: TodoData) {
    const { completed = false } = data;
    const todo: Todo = {
      id: this.todos.length,
      completed,
      message: data.message
    };

    this.todos.push(todo);

    return todo;
  }

  async setup (app: Application) {
    assert.ok(app);
  }
}

interface Configuration {
  port: number;
}

interface Services {
  todos: TodoService;
  v2: Application<{}, Configuration>
}

type MainApp = Application<Services, Configuration>;

const myHook = async (context: HookContext<MainApp>, next: NextFunction) => {
  assert.ok(context.app.service('todos'));
  await next();
}

hooks(TodoService.prototype, [
  async (_ctx: HookContext<MainApp>, next) => {
    await next();
  }
]);

hooks(TodoService, {
  create: [ myHook ]
});

describe('Feathers typings', () => {
  it('initializes the app with proper types', async () => {
    const app: MainApp = feathers<Services, Configuration>();
    const app2 = feathers<{}, Configuration> ();

    app.set('port', 80);
    app.use('todos', new TodoService());
    app.use('v2', app2);

    const service = app.service('todos');

    service.on('created', data => {
      assert.ok(data);
    });

    service.hooks({
      before: {
        all: [],
        create: [async context => {
          const { result, data } = context;

          assert.ok(result);
          assert.ok(data);
          assert.ok(context.app.service('todos'));
        }]
      }
    });

    service.hooks({
      create: [
        async (context, next) => {
          assert.ok(context);
          await next();
        },
        async (context, next) => {
          assert.ok(context);
          await next();
        },
        myHook
      ]
    });
  });
});
