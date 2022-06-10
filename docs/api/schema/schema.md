# Schemas

`schema` is a small wrapper over [JSON schema](https://json-schema.org/), [AJV](https://ajv.js.org/) and [json-schema-to-ts](https://github.com/thomasaribart/json-schema-to-ts) to define data schemas. It can also automatically get the correct TypeScript type for a schema. This allows for a single place to define your types and validation rules in plain JavaScript or TypeScript which can then be used by many other parts of a Feathers application. Schemas are also used by [resolvers](./resolvers.md) to validate and convert data before or after dynamically resolving properties.

## Definitions

If you are not familiar with JSON schema have a look at the [official getting started guide](https://json-schema.org/learn/getting-started-step-by-step). Here is an example for a possible user schema:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { schema } from '@feathersjs/schema';

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
```
:::

::: tab "TypeScript"
```ts
import { HookContext } from './definitions';
import { schema, Infer } from '@feathersjs/schema';

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
```
:::

::::

> __Very Important:__ To get the correct TypeScript types the definition always needs to be declared via `schema({} as const)`.

## Options

`schema(definition, ajv)` allows to initialize a schema with a custom AJV instance:

```js
import ajvErrors from 'ajv-errors';
import Ajv form 'ajv';
import { schema } from '@feathersjs/schema';

const ajv = new Ajv({
  coerceTypes: true
});

ajvErrors(ajv);

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
}, ajv);

```

## Extension

To create a new schema that extends an existing one, combine the schema properties from `schema.properties` (an `schema.required` if needed) with the new properties:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { schema } from '@feathersjs/schema';

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

// The user result has all properties from the user but also an
// additional `id` added by the database
export const userResultSchema = schema({
  $id: 'UserResult',
  type: 'object',
  additionalProperties: false,
  required: [...userSchema.required, 'id'],
  properties: {
    ...userSchema.properties,
    id: { type: 'number' }
  }
});
```
:::

::: tab "TypeScript"
```ts
import { HookContext } from './definitions';
import { schema, Infer } from '@feathersjs/schema';

export const userSchema = schema({
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const);

export type User = Infer<typeof userSchema>;

export const userResultSchema = schema({
  $id: 'UserResult',
  type: 'object',
  additionalProperties: false,
  required: [...userSchema.required, 'id'],
  properties: {
    ...userSchema.properties,
    id: { type: 'number' }
  }
});

export type User = Infer<typeof userResultSchema>;
```
:::

::::

## Associations

Associated schemas can be initialized via the `$ref` keyword referencing the `$id` set during schema definition.

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { schema } from '@feathersjs/schema';

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

export const messageSchema = schema({
  $id: 'Message',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    user: { $ref: 'User' }
  }
});
```
:::

::: tab "TypeScript"
In TypeScript the referenced type needs to be added explicitly.

```ts
import { HookContext } from './definitions';
import { schema, Infer } from '@feathersjs/schema';

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

export type User = Infer<typeof userSchema>;

export const messageSchema = schema({
  $id: 'Message',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    user: { $ref: 'User' }
  }
});

export type Message = Infer<typeof messageSchema> & {
  user: User
}
```
:::

::::

## Query helper

Schema ships with the following helpers to automatically create schemas that follow the [Feathers query syntax](../databases/querying.md) (like `$gt`, `$ne` etc.):

- `queryProperty` helper takes a definition for a single property (usually `{ type: '<type>' }`) and returns a schema that allows the default query operators 
- `queryProperties(schema.properties)` takes the all properties of a schema and converts them into query schema properties (using `queryProperty`)
- `querySyntax(schema.properties)` initializes all properties the additional query syntax properties `$limit`, `$skip`, `$select` and `$sort`. `$select` and `$sort` will be typed so they only allow existing schema properties.

```js
import { querySyntax } from '@feathersjs/schema';

export const userQuerySchema = schema({
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(userSchema.properties)
  }
} as const);

export type UserQuery = Infer<typeof userQuerySchema>

const userQuery: UserQuery = {
  $limit: 10,
  $select: [ 'email', 'id' ],
  $sort: {
    email: 1
  }
}
```

## Validation hooks

Schemas will be used for validation when they are passed to a [Resolver](./resolvers.md). See the [Feathers resolver](./resolvers.md#feathers-resolvers) on how to use the schema with resolvers.
