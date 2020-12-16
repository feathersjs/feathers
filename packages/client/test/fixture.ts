import feathers, { Application, HookContext, Id, Params } from '@feathersjs/feathers';
import * as express from '@feathersjs/express';
import { Service } from '@feathersjs/adapter-memory';

// eslint-disable-next-line no-extend-native
Object.defineProperty(Error.prototype, 'toJSON', {
  value () {
    const alt: any = {};

    Object.getOwnPropertyNames(this).forEach((key: string) => {
      alt[key] = this[key];
    });

    return alt;
  },
  configurable: true
});

// Create an in-memory CRUD service for our Todos
class TodoService extends Service {
  async get (id: Id, params: Params) {
    if (params.query.error) {
      throw new Error('Something went wrong');
    }

    return super.get(id).then(data =>
      Object.assign({ query: params.query }, data)
    );
  }
}

export default (configurer?: (app: Application) => void) => {
  const app = express.default(feathers())
    .configure(express.rest());

  if (typeof configurer === 'function') {
    configurer.call(app, app);
  }

  // Parse HTTP bodies
  app.use(express.json())
    .use(express.urlencoded({ extended: true }))
    // Host the current directory (for index.html)
    .use(express.static(process.cwd()))
    // Host our Todos service on the /todos path
    .use('/todos', new TodoService({
      multi: true
    }));

  const testTodo = {
    text: 'some todo',
    complete: false
  };
  const service = app.service('todos');

  service.create(testTodo);
  service.hooks({
    after: {
      remove (hook: HookContext) {
        if (hook.id === null) {
          service._uId = 0;
          return service.create(testTodo)
            .then(() => hook);
        }
      }
    }
  });

  app.on('connection', connection =>
    app.channel('general').join(connection)
  );

  if (service.publish) {
    service.publish(() => app.channel('general'));
  }

  return app;
};
