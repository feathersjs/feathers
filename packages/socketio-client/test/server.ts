import feathers, { Id, Params } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import '@feathersjs/transport-commons';
import { Service } from 'feathers-memory';

// eslint-disable-next-line no-extend-native
Object.defineProperty(Error.prototype, 'toJSON', {
  value () {
    const alt: any = {};

    Object.getOwnPropertyNames(this).forEach((key: string) => {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true,
  writable: true
});

// Create an in-memory CRUD service for our Todos
class TodoService extends Service {
  async get (id: Id, params: Params) {
    if (params.query.error) {
      throw new Error('Something went wrong');
    }

    const data = await super.get(id);

    return Object.assign({ query: params.query }, data)
  }
}

export function createServer () {
  const app = feathers()
    .configure(socketio())
    .use('/', new TodoService())
    .use('/todos', new TodoService());
  const service = app.service('todos');
  const rootService = app.service('/');
  const publisher = () => app.channel('general');
  const data = {
    text: 'some todo',
    complete: false
  };

  app.on('connection', connection =>
    app.channel('general').join(connection)
  );

  rootService.create(data);
  rootService.publish(publisher);

  service.create(data);
  service.publish(publisher);

  return app;
};
