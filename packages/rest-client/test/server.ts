import { feathers, Id, NullableId, Params } from '@feathersjs/feathers';
import expressify, { rest, urlencoded, json } from '@feathersjs/express';
import { Service } from '@feathersjs/memory';
import { FeathersError, NotAcceptable } from '@feathersjs/errors';

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

const errorHandler = function (error: FeathersError, _req: any, res: any, _next: any) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const code = !isNaN(parseInt(error.code as any, 10)) ? parseInt(error.code as any, 10) : 500;
  res.status(code);

  res.format({
    'application/json' () {
      res.json(Object.assign({}, error.toJSON()));
    }
  });
};

// Create an in-memory CRUD service for our Todos
class TodoService extends Service {
  get (id: Id, params: Params) {
    if (params.query.error) {
      throw new Error('Something went wrong');
    }

    if (params.query.feathersError) {
      throw new NotAcceptable('This is a Feathers error', { data: true });
    }

    return super.get(id)
      .then(data => {
        const result = Object.assign({ query: params.query }, data);

        if (params.authorization) {
          result.authorization = params.authorization;
        }

        return result;
      });
  }

  remove (id: NullableId, params: Params) {
    if (id === null) {
      return Promise.resolve({
        id, text: 'deleted many'
      });
    }

    if (params.query.noContent) {
      return Promise.resolve();
    }

    return super.remove(id, params);
  }

  async customMethod (data: any, { provider }: Params) {
    return {
      data,
      provider,
      type: 'customMethod'
    }
  }
}

export default (configurer?: any) => {
  const app = expressify(feathers())
    .configure(rest(function formatter (_req, res, next) {
      if (!res.data) {
        next();
      }

      res.format({
        html () {
          res.end('<h1>This is HTML content. You should not see it.</h1>');
        },

        json () {
          res.json(res.data);
        }
      });
    }))
    .use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Authorization');
      req.feathers.authorization = req.headers.authorization;
      next();
    })
    // Parse HTTP bodies
    .use(json())
    .use(urlencoded({ extended: true }))
    // Host our Todos service on the /todos path
    .use('/todos', new TodoService(), {
      methods: [
        'find', 'get', 'create', 'patch', 'update', 'remove', 'customMethod'
      ]
    })
    .use(errorHandler);

  if (typeof configurer === 'function') {
    configurer.call(app);
  }

  app.service('todos').create({
    text: 'some todo',
    complete: false
  });

  return app;
};
