# Overview

[![CI](https://github.com/feathersjs/feathers/workflows/CI/badge.svg)](https://github.com/feathersjs/feathers/actions?query=workflow%3ACI)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/socketio)](https://david-dm.org/feathersjs/feathers?path=packages/schema)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/schema.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/schema)

`@feathersjs/schema` provides a way to define data models and to dynamically resolve them. It comes in two main parts:

- [Schema](./schema.md) - Uses [JSON schema](https://json-schema.org/) to define a data model with TypeScript types and basic validations. This allows us to:
  - Ensure data is valid and always in the right format
  - Automatically get TypeScript types from schema definitions
  - Automatically generate API documentation
  - Create [database adapter](../databases/common.md) models without duplicating the data format
  - Validate query string queries and convert them to the right type
- [Resolvers](./resolvers.md) - Resolve schema properties based on a context (usually the [hook context](../hooks.md)). This can be used for many different things like:
  - Populating associations
  - Securing queries and e.g. limiting requests to a user
  - Removing protected properties for external requests
  - Ability to add read- and write permissions on the property level
  - Hashing passwords and validating dynamic password policies

Here is an example of a user schema definition and resolver:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { schema, resolve } from '@feathersjs/schema';

export const userSchema = schema({
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    password: { type: 'string' }
  }
});

export const userDataResolver = resolve({
  properties: {
    password: async (value) => {
      // Return a hashed version of the password before storing it in the database
      return bcrypt(value);
    }
  }
});

export const userResultResolver = resolve({
  properties: {
    password: async (value, _user, context) => {
      // Do not return the password for external requests
      if (context.params.provider) {
        return undefined;
      }
      return value;
    }
  }
});
```
:::

::: tab "TypeScript"
```ts
import { HookContext } from './definitions';
import { schema, resolve, Infer } from '@feathersjs/schema';

export const userSchema = schema({
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const);

export type User = Infer<typeof userSchema>;

export const userDataResolver = resolve<User, HookContext>({
  properties: {
    password: async (value) => {
      // Return a hashed version of the password before storing it in the database
      return bcrypt(value);
    }
  }
});

export const userResultResolver = resolve<User, HookContext>({
  properties: {
    password: async (value, _user, context) => {
      // Do not return the password for external requests
      if (context.params.provider) {
        return undefined;
      }

      return value;
    }
  }
});
```
:::

::::
