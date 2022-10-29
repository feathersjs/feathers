---
outline: deep
---

# TypeBox

`@feathersjs/typebox` allows to define JSON schemas with [TypeBox](https://github.com/sinclairzx81/typebox), a JSON schema type builder with static type resolution for TypeScript.

[[toc]]

<BlockQuote type="info" label="Note">

For additional information also see the [TypeBox documentation](https://github.com/sinclairzx81/typebox/blob/master/readme.md#contents).

</BlockQuote>

## Usage

The module exports all of TypeBox functionality with additional support for [query schemas](#query-schemas) and [validators](#validators). The following is an example for defining the message schema [from the guide](../../guides/basics/schemas.md#handling-messages) using TypeBox:

```ts
import { Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

const messageSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
    createdAt: Type.Number(),
    userId: Type.Number()
  },
  { $id: 'Message', additionalProperties: false }
)

type Message = Static<typeof messageSchema>
```

## Types

TypeBox provides a set of functions that allow you to compose JSON Schema similar to how you would compose static types with TypeScript. Each function creates a JSON schema fragment which can compose into more complex types. The schemas produced by TypeBox can be passed directly to any JSON Schema compliant validator, or used to reflect runtime metadata for a type.

### Standard

These are the standard TypeBox types. Each section shows equivalent code in three formats:

- TypeBox
- TypeScript type
- JSON Schema

#### Primitive Types

##### Any

```js
const T = Type.Any()
```

```js
type T = any 
```

```js
const T = { }
```

##### Unknown

```js
const T = Type.Unknown()
```

```js
type T = unknown 
```

```js
const T = { }
```

##### String

```js
const T = Type.String()
```

```js
type T = string 
```

```js
const T = {
  type: 'string'
}
```

##### Number

```js
const T = Type.Number()
```

```js
type T = number
```

```js
const T = {
  type: 'number'
}
```

##### Integer

```js
const T = Type.Integer()
```

```js
type T = number
```

```js
const T = {
  type: 'integer'
}
```

##### Boolean

```js
const T = Type.Boolean()
```

```js
type T = boolean
```

```js
const T = {
  type: 'boolean'
}
```

##### Null

```js
const T = Type.Null()
```

```js
type T = null
```

```js
const T = {
  type: 'null'
}
```

##### Literal

```js
const T = Type.Literal(42)
```

```js
type T = 42
```

```js
const T = {
  const: 42,
  type: 'number'
}
```

#### Object & Array Types

##### RegEx

```js
const T = Type.RegEx(/foo/)
```

```js
type T = string
```

```js
const T = {
  type: 'string',
  pattern: 'foo'
}
```

##### Array

```js
const T = Type.Array( Type.Number() )
```

```js
type T = number[]
```

```js
const T = {
  type: 'array',
  items: {
    type: 'number'
  }
}
```

##### Object

```js
const T = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
})
```

```js
type T = {
  x: number,
  y: number,
}
```

```js
const T = {
  type: 'object',
  properties: {
    x: {
      type: 'number'
    },
    y: {
      type: 'number'
    },
  },
  required: ['x', 'y'],
}
```

##### Tuple

```js
const T = Type.Tuple([
  Type.Number(),
  Type.Number(),
])
```

```js
type T = [number, number]
```

```js
const T = {
  type: 'array',
  items: [
    { type: 'number' },
    { type: 'number' },
  ],
  additionalItems: false,
  minItems: 2,
  maxItems: 2,
}
```

##### Enum

```js
enum Foo {
  A,
  B,
}
const T = Type.Enum(Foo)
```

```js
enum Foo {
  A,
  B,
}
type T = Foo
```

```js
const T = {
  anyOf: [
    { type: 'number', const: 0 },
    { type: 'number', const: 1 },
  ]
}
```


#### Utility Types


##### KeyOf

```js
const T = Type.KeyOf(
  Type.Object({
    x: Type.Number(),
    y: Type.Number(),
  })
)
```

```js
type T = keyof {
  x: number,
  y: number,
}
```

```js
const T = {
  anyOf: [
    { type: 'string', const: 'x' },
    { type: 'string', const: 'y' },
  ]
}
```

##### Union

```js
const T = Type.Union({
  Type.String(),
  Type.Number,
})
```

```js
type T = string | number
```

```js
const T = {
  anyOf: [
    { type: 'string' },
    { type: 'string' },
  ]
}
```

##### Intersect

```js
const T = Type.Intersect([
  Type.Object({
    x: Type.Number()
  }),
  Type.Object({
    y: Type.Number()
  }),
])
```

```js
type T = { x: number } & { y: number }
```

```js
const T = {
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
  },
  required: ['x', 'y'],
}
```

##### Never

```js
const T = Type.Never()
```

```js
type T = never
```

```js
const T = {
  allOf: [
    { type: 'boolean', const: false },
    { type: 'boolean', const: true },
  ]
}
```

##### Record

```js
const T = Type.Record( Type.String(), Type.Number() )
```

```js
type T = Record<string, number>
```

```js
const T = {
  type: 'object',
  patternProperties: {
    '^.*$': {
      type: 'number',
    }
  },
}
```

##### Partial

```js
const T = Type.Partial(
  Type.Object({
    x: Type.Number(),
    y: Type.Number(),
  })
)
```

```js
type T = Partial<{
  x: number,
  y: number,
}>
```

```js
const T = {
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
  }
}
```

##### Required

```js
const T = Type.Required(
  Type.Object({
    x: Type.Optional( Type.Number() ),
    y: Type.Optional( Type.Number() ),
  })
)
```

```js
type T = Required<{
  x?: number,
  y?: number,
}>
```

```js
const T = {
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
  },
  required: ['x', 'y'],
}
```

##### Pick

```js
const T = Type.Pick(
  Type.Object({
    x: Type.Number(),
    y: Type.Number(),
  }),
  ['x']
)
```

```js
type T = Pick<{
  x: number,
  y: number,
}, 'x'>
```

```js
const T = {
  type: 'object',
  properties: {
    x: { type: 'number' },
  },
  required: ['x'],
}
```

##### Omit

```js
const T = Type.Omit(
  Type.Object({
    x: Type.Number(),
    y: Type.Number(),
  }),
  ['x']
)
```

```js
type T = Omit<{
  x: number,
  y: number,
}, 'x'>
```

```js
const T = {
  type: 'object',
  properties: {
    y: { type: 'number' },
  },
  required: ['y'],
}
```

### Modifiers

TypeBox provides modifiers that can be applied to an objects properties. This allows for `optional` and `readonly` to be applied to that property. The following table illustates how they map between TypeScript and JSON Schema.

#### Optional

```js
const T = Type.Object({
  name: Type.Optional( Type.String() )
})
```

```js
type T = {
  name?: string
}
```

```js
const T = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
  },
}
```

#### Readonly

```js
const T = Type.Object({
  name: Type.Readonly( Type.String() )
})
```

```js
type T = {
  readonly name: string
}
```

```js
const T = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
  },
  required: ['name'],
}
```

#### ReadonlyOptional

```js
const T = Type.Object({
  name: Type.ReadonlyOptional( Type.String() )
})
```

```js
type T = {
  readonly name?: string
}
```

```js
const T = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
  },
}
```

### Options

You can pass additional JSON schema options on the last argument of any given type. The following are some examples.

```ts
// string must be an email
const T = Type.String({ format: 'email' })

// number must be a multiple of 2
const T = Type.Number({ multipleOf: 2 })

// array must have at least 5 integer values
const T = Type.Array(Type.Integer(), { minItems: 5 })
```

### Extended

In addition to JSON schema types, TypeBox provides several extended types that allow for the composition of `function` and `constructor` types. These additional types are not valid JSON Schema and will not validate using typical JSON Schema validation. However, these types can be used to frame JSON schema and describe callable interfaces that may receive JSON validated data. These types are as follows.

#### Constructor

```js
const T = Type.Constructor([
  Type.String(),
  Type.Number(),
], Type.Boolean())
```

```js
type T = new (
  arg0: string,
  arg1: number,
) => boolean
```

```js
const T = {
  type: 'constructor',
  parameters: [
    { type: 'string' },
    { type: 'number' },
  ],
  return {
    type: 'boolean',
  },
}
```

#### Function

```js
const T = Type.Function([
  Type.String(),
  Type.Number(),
], Type.Boolean())
```

```js
type T = {
  arg0: string,
  arg1: number,
} => boolean
```

```js
const T = {
  type: 'function',
  parameters: [
    { type: 'string' },
    { type: 'number' },
  ],
  return {
    type: 'boolean',
  },
}
```

#### Uint8Array

```js
const T = Type.Uint8Array()
```

```js
type T = Uint8Array
```

```js
const T = {
  type: 'object',
  specialized: 'Uint8Array',
}
```

#### Promise

```js
const T = Type.Promise( Type.String() )
```

```js
type T = Promise<string>
```

```js
const T = {
  type: 'promise',
  item: { type: 'string' },
}
```

#### Undefined

```js
const T = Type.Undefined()
```

```js
type T = undefined
```

```js
const T = {
  type: 'object',
  specialized: 'Undefined',
}
```

#### Void

```js
const T = Type.Void()
```

```js
type T = void
```

```js
const T = {
  type: 'null'
}
```

### Reference

Use `Type.Ref(...)` to create referenced types. The target type must specify an `$id`.

```ts
const T = Type.String({ $id: 'T' })
const R = Type.Ref(T)
```

## Result and data schemas

A good approach to define schemas in a Feathers application is to create the main schema first. This is usually the properties that are in the database and things like associated entries. Then we can get the data schema by e.g. picking the properties a client submits using `Type.Pick`

```ts
import { Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

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

// Pick the data for creating a new user
const userDataSchema = Type.Pick(userSchema, ['email', 'password'])

type UserData = Static<typeof userDataSchema>

const messageSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
    createdAt: Type.Number(),
    userId: Type.Number(),
    // Reference the user
    user: Type.Ref(userSchema)
  },
  { $id: 'Message', additionalProperties: false }
)

type Message = Static<typeof messageSchema>

// Pick the data for creating a new message
const messageDataSchema = Type.Pick(messageSchema, ['text'])

type MessageData = Static<typeof messageDataSchema>
```

## Query schemas

### querySyntax

`querySyntax(definition)` returns a schema to validate the [Feathers query syntax](../databases/querying.md) for all properties in a TypeBox definition.

```ts
import { querySyntax } from '@feathersjs/typebox'

// Schema for allowed query properties
const messageQueryProperties = Type.Pick(messageSchema, ['id', 'text', 'createdAt', 'userId'], {
  additionalProperties: false
})
const messageQuerySchema = querySyntax(messageQueryProperties)

type MessageQuery = Static<typeof messageQuerySchema>
```

### queryProperty

`queryProperty(definition)` returns a schema for the [Feathers query syntax](../databases/querying.md) for a single property.

## Validators

The following functions are available to get a [validator function](./validators.md) from a TypeBox schema.

<BlockQuote type="info" label="note">

See the [validators](./validators.md) chapter for more information on validators and validator functions.

</BlockQuote>

### getDataValidator

`getDataValidator(definition, validator)` returns validators for the data of `create`, `update` and `patch` service methods. You can either pass a single definition in which case all properties of the `patch` schema will be optional or individual validators for `create`, `update` and `patch`.

```ts
import { Ajv } from '@feathersjs/schema'
import { Type, getDataValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

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

// Pick the data for creating a new user
const userDataSchema = Type.Pick(userSchema, ['email', 'password'])

const dataValidator = new Ajv()

const userDataValidator = getDataValidator(userDataSchema, dataValidator)

// For more granular control
const userDataValidator = getDataValidator(
  {
    create: userDataSchema,
    update: userDataSchema,
    patch: Type.Partial(userDataSchema)
  },
  dataValidator
)
```

### getValidator

`getValidator(definition, validator)` returns a single validator function for a TypeBox schema.

```ts
import { Ajv } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'

// Schema for allowed query properties
const messageQueryProperties = Type.Pick(messageSchema, ['id', 'text', 'createdAt', 'userId'], {
  additionalProperties: false
})
const messageQuerySchema = querySyntax(messageQueryProperties)
type MessageQuery = Static<typeof messageQuerySchema>

// Since queries can be only strings we can to coerce them
const queryValidator = new Ajv({
  coerceTypes: true
})

const messageQueryValidator = getValidator(messageQuerySchema, queryValidator)
```
