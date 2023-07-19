---
outline: deep
---

# JSON Schema

As an alternative to [TypeBox](./typebox.md), `@feathersjs/schema` also provides the ability to define plain JSON schemas as objects. It uses [json-schema-to-ts](https://github.com/thomasaribart/json-schema-to-ts) to turn those schemas into TypeScript types.

<BlockQuote label="Need JSON Schema help?">

You can find an introduction in the [JSON schema official getting started guide](https://json-schema.org/learn/getting-started-step-by-step) and a lot of type-specific JSON Schema examples in the [json-schema-to-ts docs](https://github.com/ThomasAribart/json-schema-to-ts).

</BlockQuote>

## Creating Schemas

### Definitions

If you are not familiar with JSON schema have a look at the [official getting started guide](https://json-schema.org/learn/getting-started-step-by-step). Here is an example for a possible user schema:

```ts
import type { FromSchema } from '@feathersjs/schema'

export const userSchema = {
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const

export type User = FromSchema<typeof userSchema>
```

<LanguageBlock global-id="ts">

### Generating Correct Types

For correct TypeScript types, the definition always **needs to be declared `as const`**. This first example will not produce correct types because the definition is not immediately followed by `as const`:

```ts
// Will not produce correct types.
const definition = { type: 'object' } // `as const` is missing, here.
```

This next example does declare `as const` after the `definition`, so the types will be generated correctly:

```ts
// Produces correct types.
const definition = { type: 'object' } as const
```

</LanguageBlock>

## Extending Schemas

To create a new schema that extends an existing one, combine the schema properties (and `schema.required`, if used) with the new properties:

```ts
import type { FromSchema } from '@feathersjs/schema'

export const userDataSchema = {
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const

export type UserData = FromSchema<typeof userDataSchema>

export const userSchema = {
  $id: 'UserResult',
  type: 'object',
  additionalProperties: false,
  required: [...userDataSchema.required, 'id'],
  properties: {
    ...userDataSchema.properties,
    id: { type: 'number' }
  }
} as const

export type User = FromSchema<typeof userSchema>
```

## References

Associated schemas can be initialized via the `$ref` keyword referencing the `$id` set during schema definition.

<LanguageBlock global-id="ts">

In TypeScript, the referenced type needs to be added explicitly.

</LanguageBlock>

```ts
import type { FromSchema } from '@feathersjs/schema'

export const userSchema = {
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const

export type User = FromSchema<typeof userSchema>

export const messageSchema = {
  $id: 'Message',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    user: { $ref: 'User' }
  }
} as const

export type Message = FromSchema<
  typeof messageSchema,
  {
    // All schema references need to be passed to get the correct type
    references: [typeof userSchema]
  }
>
```

## Query Helpers

Schema ships with a few helpers to automatically create schemas that comply with the [Feathers query syntax](../databases/querying.md) (like `$gt`, `$ne` etc.):

### querySyntax

`querySyntax(schema.properties, extensions)` initializes all properties the additional query syntax properties `$limit`, `$skip`, `$select` and `$sort`. `$select` and `$sort` will be typed so they only allow existing schema properties.

```ts
import { querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

export const userQuerySchema = {
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(userSchema.properties)
  }
} as const

export type UserQuery = FromSchema<typeof userQuerySchema>

const userQuery: UserQuery = {
  $limit: 10,
  $select: ['email', 'id'],
  $sort: {
    email: 1
  }
}
```

Additional special query properties [that are not already included in the query syntax](../databases/querying.md) like `$ilike` can be added like this:

```ts
import { querySyntax } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

export const userQuerySchema = {
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(userSchema.properties, {
      email: {
        $ilike: {
          type: 'string'
        }
      }
    } as const)
  }
} as const

export type UserQuery = FromSchema<typeof userQuerySchema>

const userQuery: UserQuery = {
  $limit: 10,
  $select: ['email', 'id'],
  $sort: {
    email: 1
  },
  email: {
    $ilike: '%@example.com'
  }
}
```

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
import { queryProperty } from '@feathersjs/schema'

export const userQuerySchema = {
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    name: queryProperty({ type: 'string' })
  }
} as const
```

With the `queryProperty` utility in place, the schema will allow querying on `name` using any of the above-listed operators. With it in place, the query in the following example will not throw an error:

```ts
const query = { name: { $in: ['Marco', 'Polo'] } }

app.service('users').find({ query })
```

You can learn how it works, [here](https://github.com/feathersjs/feathers/blob/dove/packages/schema/src/query.ts#L29-L55).

### queryProperties

`queryProperties(schema.properties)` takes the all properties of a schema and converts them into query schema properties (using `queryProperty`)

## Validators

The following functions are available to get a [validator function](./validators.md) from a JSON schema definition.

<BlockQuote type="info" label="note">

See the [validators](./validators.md) chapter for more information on validators and validator functions.

</BlockQuote>

### getDataValidator

`getDataValidator(definition, validator)` returns validators for the data of `create`, `update` and `patch` service methods. You can either pass a single definition in which case all properties of the `patch` schema will be optional or individual validators for `create`, `update` and `patch`.

```ts
import { getDataValidator, Ajv } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

const userDataSchema = {
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const

type UserData = FromSchema<typeof userDataSchema>

const dataValidator = new Ajv()

const dataValidator = getDataValidator(userDataSchema, dataValidator)
```

### getValidator

`getValidator(definition, validator)` returns a single validator function for a JSON schema.

```ts
import { querySyntax, Ajv, getValidator } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

export const userQuerySchema = {
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(userSchema.properties)
  }
} as const

export type UserQuery = FromSchema<typeof userQuerySchema>

// Since queries can be only strings we can to coerce them
const queryValidator = new Ajv({
  coerceTypes: true
})

const messageValidator = getValidator(userQuerySchema, queryValidator)
```
