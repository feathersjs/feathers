import {
  feathers, HookContext, Application as FeathersApplication
} from '@feathersjs/feathers';
import { memory, Service } from '@feathersjs/memory';

import {
  schema, resolve, Infer, resolveResult,
  queryProperty, queryArray, resolveQuery,
  validateQuery, validateData, resolveData
} from '../src';

export const userSchema = schema({
  $id: 'UserData',
  type: 'object',
  additionalProperties: false,
  required: ['email'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const);

export const userResultSchema = userSchema.extend({
  $id: 'UserResult',
  properties: {
    id: { type: 'number' }
  }
});

export type User = Infer<typeof userSchema>;
export type UserResult = Infer<typeof userResultSchema>;

export const userDataResolver = resolve<User, HookContext<Application>>({
  properties: {
    password: async () => {
      return 'hashed';
    }
  }
});

export const userResultResolver = resolve<UserResult, HookContext<Application>>({
  properties: {
    password: async (value, _user, context) => {
      return context.params.provider ? undefined : value;
    }
  }
});

export const messageSchema = schema({
  $id: 'MessageData',
  type: 'object',
  additionalProperties: false,
  required: ['text', 'userId'],
  properties: {
    text: { type: 'string' },
    userId: { type: 'number' }
  }
} as const);

export const messageResultSchema = messageSchema.extend({
  $id: 'MessageResult',
  properties: {
    id: { type: 'number' },
    user: { $ref: 'UserResult' }
  }
});

export const messageQuerySchema = schema({
  $id: 'MessageQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    $resolve: queryArray(messageResultSchema.propertyNames),
    $limit: {
      type: 'number',
      minimum: 0,
      maximum: 100
    },
    $skip: {
      type: 'number'
    },
    userId: queryProperty({
      type: 'number'
    })
  }
} as const);

export type MessageQuery = Infer<typeof messageQuerySchema>;

export const messageQueryResolver = resolve<MessageQuery, HookContext<Application>>({
  properties: {
    $resolve: async (value) => {
      return value || messageResultSchema.propertyNames;
    },

    userId: async (value, _query, context) => {
      if (context.params?.user) {
        return context.params.user.id;
      }

      return value;
    }
  }
});

export type Message = Infer<typeof messageSchema>;
export type MessageResult = Infer<typeof messageResultSchema> & {
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
  users: Service<UserResult, User>,
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
