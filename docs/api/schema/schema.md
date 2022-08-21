---
outline: deep
---

# Schemas

`schema` is a small wrapper around three existing projects:

- [JSON schema](https://json-schema.org/) for defining schemas.
- [AJV](https://ajv.js.org/) for validating objects with those schemas.
- [json-schema-to-ts](https://github.com/thomasaribart/json-schema-to-ts) to convert those schemas to TypeScript types.

This package essentially allows for a single place to define your types and validation rules in plain JavaScript or TypeScript which can then be used by many other parts of a Feathers application.

Schemas are also used by [resolvers](./resolvers.md) to validate and convert data before or after dynamically resolving properties.

<BlockQuote label="Need JSON Schema help?">

You can find a lot of type-specific JSON Schema examples in the [json-schema-to-ts docs](https://github.com/ThomasAribart/json-schema-to-ts).

</BlockQuote>

## Creating Schemas

### Definitions

If you are not familiar with JSON schema have a look at the [official getting started guide](https://json-schema.org/learn/getting-started-step-by-step). Here is an example for a possible user schema:

```ts
import { HookContext } from './definitions'
import { schema, Infer } from '@feathersjs/schema'

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
} as const)

export type User = Infer<typeof userSchema>
```

<LanguageBlock global-id="ts">

<BlockQuote label="very important">

To get the correct TypeScript types the definition always needs to be declared `as const`. [See examples](#generating-correct-types).

</BlockQuote>

</LanguageBlock>

### AJV

AJV is the JSON Schema validator that runs under the hood of Feathers Schema. We chose it because it's fully compliant with the JSON Schema spec and it's the fastest JSON Schema validator because it has its own compiler. It pre-compiles code for each validator, instead of dynamically creating validators from schemas during runtime. The Feathers Schema package takes care of the compiling part for you, so you generally don't have to do it yourself.

<BlockQuote type="info" label="Environments Requiring Pre-Compiled Schema">

The only time you would need to manually compile validators would be if you're deploying to an environment where dynamic code generation APIs are not available, such as Cloudflare Workers. Any environment that doesn't support the [`eval` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) will require pre-compiling each schema.

</BlockQuote>

<BlockQuote type="info" label="Security Concerns with Compiling Schema">

AJV uses [JavaScript's global `eval` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) under the hood to pre-compile its schema. It's normally frowned upon to use `eval` due to security risks. In the case of Feathers Schema, the risk is eliminated as long as you are not dynamically compiling schema. The generator sets up the Feathers application to compile during startup, which virtually eliminates the risk of running arbitrary or malicious code.

</BlockQuote>

The primary utility in AJV is the `AJV` class. You need an AJV class instance in order to register and run validators. Feathers Schema handles this for you under the hood by providing a default `ajv` singleton instance. Sometimes it's necessary to customize AJV to work in a specific way for your app. You'll learn how to provide a custom AJV instance to Feathers Schema in the next section.

#### Customize AJV

Learn what AJV options are customizable in the [AJV class API docs](https://ajv.js.org/options.html).

#### Add Formatters to AJV

Save yourself some time making a custom formatter. Learn how to apply AJV's extended formatters in the [ajv-formats docs](https://ajv.js.org/packages/ajv-formats.html).

#### Example of Customized AJV

See an example of custom keywords and formatters in the [MongoDB adapter documentation](/api/database/mongodb#using-a-custom-ajv-instance).

### schema(definition, ajv)

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

### Generating Correct Types

For correct TypeScript types, the definition always needs to be declared `as const`. This first example will not produce correct types because the definition is not immediately followed by `as const`:

```ts
// Will not produce correct types.
const definition = { type: 'object' } // `as const` is missing, here.
const userSchema = schema(definition)
```

This next example does declare `as const` after the `definition`, so the types will be generated correctly:

```ts
// Produces correct types.
const definition = { type: 'object' } as const
const userSchema = schema(definition)
```

## Extending Schemas

To create a new schema that extends an existing one, combine the schema properties from `schema.properties` (and `schema.required`, if used) with the new properties:

<LanguageBlock global-id="ts">

```ts
import { HookContext } from './definitions'
import { schema, Infer } from '@feathersjs/schema'

export const userSchema = schema({
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const)

export type User = Infer<typeof userSchema>

export const userResultSchema = schema({
  $id: 'UserResult',
  type: 'object',
  additionalProperties: false,
  required: [...userSchema.required, 'id'],
  properties: {
    ...userSchema.properties,
    id: { type: 'number' }
  }
})

export type User = Infer<typeof userResultSchema>
```

</LanguageBlock>

<LanguageBlock global-id="js">

```js
import { schema } from '@feathersjs/schema'

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
})

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
})
```

</LanguageBlock>

## Associations with `$ref`

Associated schemas can be initialized via the `$ref` keyword referencing the `$id` set during schema definition.

<LanguageBlock global-id="ts">

In TypeScript, the referenced type needs to be added explicitly.

</LanguageBlock>

```ts
import { HookContext } from './definitions'
import { schema, Infer } from '@feathersjs/schema'

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
})

export type User = Infer<typeof userSchema>

export const messageSchema = schema({
  $id: 'Message',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    user: { $ref: 'User' }
  }
})

export type Message = Infer<typeof messageSchema> & {
  user: User
}
```

## Query Helpers

Schema ships with a few helpers to automatically create schemas that comply with the [Feathers query syntax](../databases/querying.md) (like `$gt`, `$ne` etc.):

### queryProperty

`queryProperty` helper takes a definition for a single property and returns a schema that allows the default query operators. This helper supports the operators listed, below. Learn what each one means in the [common query operator](/api/databases/querying#operators) documentation.

- `$gt`
- `$gte`
- `$lt`
- `$lte`
- `$ne`
- `$in`
- `$nin`

The `name` property in the example, below, shows how `queryProperty` wraps a single property's definition.

```ts
export const userQuerySchema = schema({
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    name: queryProperty({ type: 'string' })
  }
} as const)
```

With the `queryProperty` utility in place, the schema will allow querying on `name` using any of the above-listed operators. With it in place, the query in the following example will not throw an error:

```ts
const query = { name: { $in: ['Marco', 'Polo'] } }

app.service('users').find({ query })
```

You can learn how it works, [here](https://github.com/feathersjs/feathers/blob/dove/packages/schema/src/query.ts#L29-L55).

### queryProperties

`queryProperties(schema.properties)` takes the all properties of a schema and converts them into query schema properties (using `queryProperty`)

### querySyntax

`querySyntax(schema.properties)` initializes all properties the additional query syntax properties `$limit`, `$skip`, `$select` and `$sort`. `$select` and `$sort` will be typed so they only allow existing schema properties.

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
