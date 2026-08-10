---
outline: deep
---

# Validators

[Ajv](https://ajv.js.org/) is the default JSON Schema validator used by `@feathersjs/schema`. We chose it because it's fully compliant with the JSON Schema spec and it's the fastest JSON Schema validator because it has its own compiler. It pre-compiles code for each validator, instead of dynamically creating validators from schemas during runtime.

<BlockQuote type="warning" label="Important">

Ajv and most other validation libraries are only used for ensuring data is valid and are not designed to convert data to different types. Type conversions and populating data can be done using [resolvers](./resolvers.md). This ensures a clean separation of concern between validating and populating data.

</BlockQuote>

## Usage

The following is the standard `validators.ts` file that sets up a validator for data and queries (for which string types will be coerced automatically). It also sets up a collection of additional formats using [ajv-formats](https://ajv.js.org/packages/ajv-formats.html). The validators in this file can be customized according to the [Ajv documentation](https://ajv.js.org/) and [its plugins](https://ajv.js.org/packages/). You can find the available Ajv options in the [Ajv class API docs](https://ajv.js.org/options.html).

```ts
import { Ajv, addFormats } from '@feathersjs/schema'
import type { FormatsPluginOptions } from '@feathersjs/schema'

const formats: FormatsPluginOptions = [
  'date-time',
  'time',
  'date',
  'email',
  'hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex'
]

export const dataValidator = addFormats(new Ajv({}), formats)

export const queryValidator = addFormats(
  new Ajv({
    coerceTypes: true
  }),
  formats
)
```

## Validation functions

A validation function takes data and validates them against a schema using a validator. They can be used with any validation library. Currently the `getValidator` functions are available for:

- [TypeBox schema](./typebox.md#validators) to validate a TypeBox definition using an Ajv validator instance
- [JSON schema](./schema.md#validators) to validate a JSON schema object using an Ajv validator instance

## Hooks

The following hooks take a [validation function](#validation-functions) and validate parts of the [hook context](../hooks.md#hook-context).

### validateData

`schemaHooks.validateData` takes a [validation function](#validation-functions) and allows to validate the `data` in a `create`, `update` and `patch` request as well as [custom service methods](../services.md#custom-methods). It can be used as an `around` or `before` hook.

```ts
import { Ajv, hooks as schemaHooks } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { dataValidator } from '../validators'

const userSchema = Type.Object(
  {
    id: Type.Number(),
    email: Type.String(),
    password: Type.String(),
    avatar: Type.Optional(Type.String())
  },
  { $id: 'User', additionalProperties: false }
)
type User = Static<typeof userSchema>

const userDataSchema = Type.Pick(userSchema, ['email', 'password'])

// Returns validation functions for `create`, `update` and `patch`
const userDataValidator = getValidator(userDataSchema, dataValidator)

app.service('users').hooks({
  before: {
    all: [schemaHooks.validateData(userDataValidator)]
  }
})
```

### validateQuery

`schemaHooks.validateQuery` takes a [validation function](#validation-functions) and validates the `query` of a request. It can be used as an `around` or `before` hook. When using the `queryValidator` from the [usage](#usage) section, strings will automatically be converted to the right type using [Ajv's type coercion rules](https://ajv.js.org/coercion.html).

#### Query validation replaces adapter sanitization

Database adapters have a built-in query sanitizer that only allows the [common query syntax](../databases/querying.md) plus any extra `operators` / `filters` you configure on the service. That is the default path when you do **not** use `validateQuery`.

When you use `validateQuery`, you opt into a different path by design:

1. The query is validated against **your** schema.
2. A successful validation marks the query as validated.
3. The adapter **skips** its built-in `$` operator and filter allowlist for that request.

Your query schema is then the full allowlist for client queries on that service. Anything the schema accepts can reach the database adapter. Anything it rejects is blocked before the adapter runs.

This is intentional. Schema validation and the legacy sanitizer are alternative ways to define allowed queries, not layers that always run together.

**Write query schemas as allowlists:**

- Prefer [`querySyntax`](./typebox.md#querysyntax) (or the [JSON schema helpers](./schema.md#query-helpers)) so only the common operators are allowed on each property.
- Set `additionalProperties: false` on query objects so unknown keys (including unexpected `$` operators) are rejected. Generated applications already do this.
- Only add extra operators (for example `$ilike` or `$regex`) when your adapter supports them and your application needs them.
- Avoid permissive schemas such as `additionalProperties: true` or an open object on external query validation unless you intentionally want clients to send those keys.

```ts
import { Ajv, schemaHooks } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import { queryValidator } from '../validators'

// Schema for allowed query properties
const messageQueryProperties = Type.Pick(messageSchema, ['id', 'text', 'createdAt', 'userId'], {
  additionalProperties: false
})
const messageQuerySchema = querySyntax(messageQueryProperties)
type MessageQuery = Static<typeof messageQuerySchema>

const messageQueryValidator = getValidator(messageQuerySchema, queryValidator)

app.service('messages').hooks({
  around: {
    all: [schemaHooks.validateQuery(messageQueryValidator)]
  }
})
```

### Using validators with custom methods

You can optionally create validators for your custom methods. For example we will create a custom method in our `user` service that simply says "Hello ${name}" to the requestor.

For the example we can use this TypeBox schema

```ts
//Our request object, we expect something like {name: "Bob"}
export const sayHelloRequest = Type.Object(
  {
    name: Type.String({
      description: "Who are we saying hello to!",
      examples: ["Bob"],
      minLength: 2,
    }),
  },
  { $id: "sayHelloRequest", additionalProperties: false },
);

//We intend on returning an object with a string response property
export const sayHelloResponse = Type.Object(
  { response: Type.String() },
  { $id: "sayHelloResponse", additionalProperties: false },
);

export const sayHelloValidator = getValidator(sayHelloRequest, dataValidator);
```

In our user class file, we can define our custom method

```ts
async sayHello(data: Static<typeof sayHelloRequest>): Promise<Static<typeof sayHelloResponse>> {  
  const { name } = data  
  return { response: `Hello ${name}` }  
}
```

Finally, we can add our validator in our service hooks

```ts
sayHello: [schemaHooks.validateData(sayHelloValidator)]
```
