import {
  feathers, HookContext, Application as FeathersApplication
} from '@feathersjs/feathers';
import { memory, Service } from '@feathersjs/memory';

import {
  schema, resolve, Infer, resolveResult,
  propertyQuery, selectQuery,
  validateQuery, validateData, resolveQuery, resolveData
} from '../src';

export const userSchema = schema({
  type: 'object',
  additionalProperties: false,
  required: ['email'],
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const);

export type User = Infer<typeof userSchema>;

export const userDataResolver = resolve<User, HookContext<Application>>({
  properties: {
    password: async () => {
      return 'hashed';
    }
  }
});

export const userResultResolver = resolve<User, HookContext<Application>>({
  properties: {
    password: async (value, _user, context) => {
      return context.params.provider ? undefined : value;
    }
  }
});

export const messageSchema = schema({
  type: 'object',
  additionalProperties: false,
  required: ['text', 'userId'],
  properties: {
    text: { type: 'string' },
    userId: { type: 'number' }
  }
} as const);

export const messageQuerySchema = schema({
  type: 'object',
  additionalProperties: false,
  properties: {
    $select: selectQuery(['text', 'userId']),
    $limit: {
      type: 'number',
      minimum: 0,
      maximum: 100
    },
    $skip: {
      type: 'number'
    },
    userId: propertyQuery({
      type: 'number'
    })
  }
} as const);

export type MessageQuery = Infer<typeof messageQuerySchema>;

export const messageQueryResolver = resolve<MessageQuery, HookContext<Application>>({
  properties: {
    userId: async (value, _query, context) => {
      if (context.params?.user) {
        return context.params.user.id;
      }

      return value;
    }
  }
});

export type Message = Infer<typeof messageSchema>;
export type MessageResult = Message & {
  user: User;
};

export const messageResultResolver = resolve<MessageResult, HookContext<Application>>({
  properties: {
    user: async (_value, message, context) => {
      const { userId } = message;

      return context.app.service('users').get(userId, context.params);
    }
  }
});

type ServiceTypes = {
  users: Service<User>,
  messages: Service<MessageResult, Message>
}
type Application = FeathersApplication<ServiceTypes>;

const app = feathers<ServiceTypes>()
  .use('users', memory())
  .use('messages', memory());

app.service('messages').hooks([
  validateQuery(messageQuerySchema),
  resolveQuery(messageQueryResolver),
  resolveResult(messageResultResolver)
]);

app.service('users').hooks([
  resolveResult(userResultResolver)
]);

app.service('users').hooks({
  create: [
    validateData(userSchema),
    resolveData(userDataResolver)
  ]
});

export { app };
