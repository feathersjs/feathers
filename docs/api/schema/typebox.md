---
outline: deep
---

# TypeBox

`@feathersjs/typebox` allows to define JSON schemas with [TypeBox](https://github.com/sinclairzx81/typebox), a JSON schema type builder with static type resolution for TypeScript.

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

The following table lists the standard TypeBox types.

```js
┌────────────────────────────────┬─────────────────────────────┬────────────────────────────────┐
│ TypeBox                        │ TypeScript                  │ JSON Schema                    │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Any()           │ type T = any                │ const T = { }                  │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Unknown()       │ type T = unknown            │ const T = { }                  │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.String()        │ type T = string             │ const T = {                    │
│                                │                             │   type: 'string'               │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Number()        │ type T = number             │ const T = {                    │
│                                │                             │   type: 'number'               │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Integer()       │ type T = number             │ const T = {                    │
│                                │                             │   type: 'integer'              │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Boolean()       │ type T = boolean            │ const T = {                    │
│                                │                             │   type: 'boolean'              │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Null()          │ type T = null               │ const T = {                    │
│                                │                             │    type: 'null'                │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.RegEx(/foo/)    │ type T = string             │ const T = {                    │
│                                │                             │    type: 'string',             │
│                                │                             │    pattern: 'foo'              │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Literal(42)     │ type T = 42                 │ const T = {                    │
│                                │                             │    const: 42,                  │
│                                │                             │    type: 'number'              │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Array(          │ type T = number[]           │ const T = {                    │
│   Type.Number()                │                             │   type: 'array',               │
│ )                              │                             │   items: {                     │
│                                │                             │     type: 'number'             │
│                                │                             │   }                            │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Object({        │ type T = {                  │ const T = {                    │
│   x: Type.Number(),            │   x: number,                │   type: 'object',              │
│   y: Type.Number()             │   y: number                 │   properties: {                │
│ })                             │ }                           │      x: {                      │
│                                │                             │        type: 'number'          │
│                                │                             │      },                        │
│                                │                             │      y: {                      │
│                                │                             │        type: 'number'          │
│                                │                             │      }                         │
│                                │                             │   },                           │
│                                │                             │   required: ['x', 'y']         │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Tuple([         │ type T = [number, number]   │ const T = {                    │
│   Type.Number(),               │                             │   type: 'array',               │
│   Type.Number()                │                             │   items: [{                    │
│ ])                             │                             │      type: 'number'            │
│                                │                             │    }, {                        │
│                                │                             │      type: 'number'            │
│                                │                             │    }],                         │
│                                │                             │    additionalItems: false,     │
│                                │                             │    minItems: 2,                │
│                                │                             │    maxItems: 2                 │
│                                │                             │ }                              │
│                                │                             │                                │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ enum Foo {                     │ enum Foo {                  │ const T = {                    │
│   A,                           │   A,                        │   anyOf: [{                    │
│   B                            │   B                         │     type: 'number',            │
│ }                              │ }                           │     const: 0                   │
│                                │                             │   }, {                         │
│ const T = Type.Enum(Foo)       │ type T = Foo                │     type: 'number',            │
│                                │                             │     const: 1                   │
│                                │                             │   }]                           │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.KeyOf(          │ type T = keyof {            │ const T = {                    │
│   Type.Object({                │   x: number,                │   anyOf: [{                    │
│     x: Type.Number(),          │   y: number                 │     type: 'string',            │
│     y: Type.Number()           │ }                           │     const: 'x'                 │
│   })                           │                             │   }, {                         │
│ )                              │                             │     type: 'string',            │
│                                │                             │     const: 'y'                 │
│                                │                             │   }]                           │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Union([         │ type T = string | number    │ const T = {                    │
│   Type.String(),               │                             │   anyOf: [{                    │
│   Type.Number()                │                             │      type: 'string'            │
│ ])                             │                             │   }, {                         │
│                                │                             │      type: 'number'            │
│                                │                             │   }]                           │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Intersect([     │ type T = {                  │ const T = {                    │
│   Type.Object({                │   x: number                 │   type: 'object',              │
│     x: Type.Number()           │ } & {                       │   properties: {                │
│   }),                          │   y: number                 │     x: {                       │
│   Type.Object({                │ }                           │       type: 'number'           │
│     y: Type.Number()           │                             │     },                         │
│   })                           │                             │     y: {                       │
│ ])                             │                             │       type: 'number'           │
│                                │                             │     }                          │
│                                │                             │   },                           │
│                                │                             │   required: ['x', 'y']         │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Never()         │ type T = never              │ const T = {                    │
│                                │                             │   allOf: [{                    │
│                                │                             │     type: 'boolean',           │
│                                │                             │     const: false               │
│                                │                             │   }, {                         │
│                                │                             │     type: 'boolean',           │
│                                │                             │     const: true                │
│                                │                             │   }]                           │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Record(         │ type T = Record<            │ const T = {                    │
│   Type.String(),               │   string,                   │   type: 'object',              │
│   Type.Number()                │   number,                   │   patternProperties: {         │
│ )                              │ >                           │     '^.*$': {                  │
│                                │                             │       type: 'number'           │
│                                │                             │     }                          │
│                                │                             │   }                            │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Partial(        │ type T = Partial<{          │ const T = {                    │
│   Type.Object({                │   x: number,                │   type: 'object',              │
│     x: Type.Number(),          │   y: number                 │   properties: {                │
│     y: Type.Number()           | }>                          │     x: {                       │
│   })                           │                             │       type: 'number'           │
│ )                              │                             │     },                         │
│                                │                             │     y: {                       │
│                                │                             │       type: 'number'           │
│                                │                             │     }                          │
│                                │                             │   }                            │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Required(       │ type T = Required<{         │ const T = {                    │
│   Type.Object({                │   x?: number,               │   type: 'object',              │
│     x: Type.Optional(          │   y?: number                │   properties: {                │
│       Type.Number()            | }>                          │     x: {                       │
│     ),                         │                             │       type: 'number'           │
│     y: Type.Optional(          │                             │     },                         │
│       Type.Number()            │                             │     y: {                       │
│     )                          │                             │       type: 'number'           │
│   })                           │                             │     }                          │
│ )                              │                             │   },                           │
│                                │                             │   required: ['x', 'y']         │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Pick(           │ type T = Pick<{             │ const T = {                    │
│   Type.Object({                │   x: number,                │   type: 'object',              │
│     x: Type.Number(),          │   y: number                 │   properties: {                │
│     y: Type.Number()           | }, 'x'>                     │     x: {                       │
│   }), ['x']                    │                             │       type: 'number'           │
│ )                              │                             │     }                          │
│                                │                             │   },                           │
│                                │                             │   required: ['x']              │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Omit(           │ type T = Omit<{             │ const T = {                    │
│   Type.Object({                │   x: number,                │   type: 'object',              │
│     x: Type.Number(),          │   y: number                 │   properties: {                │
│     y: Type.Number()           | }, 'x'>                     │     y: {                       │
│   }), ['x']                    │                             │       type: 'number'           │
│ )                              │                             │     }                          │
│                                │                             │   },                           │
│                                │                             │   required: ['y']              │
│                                │                             │ }                              │
│                                │                             │                                │
└────────────────────────────────┴─────────────────────────────┴────────────────────────────────┘
```

### Modifiers

TypeBox provides modifiers that can be applied to an objects properties. This allows for `optional` and `readonly` to be applied to that property. The following table illustates how they map between TypeScript and JSON Schema.

```js
┌────────────────────────────────┬─────────────────────────────┬────────────────────────────────┐
│ TypeBox                        │ TypeScript                  │ JSON Schema                    │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Object({        │ type T = {                  │ const T = {                    │
│   name: Type.Optional(         │   name?: string             │   type: 'object',              │
│     Type.String()              │ }                           │   properties: {                │
│   )                            │                             │      name: {                   │
│ })  	                         │                             │        type: 'string'          │
│                                │                             │      }                         │
│                                │                             │   }                            │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Object({        │ type T = {                  │ const T = {                    │
│   name: Type.Readonly(         │   readonly name: string     │   type: 'object',              │
│     Type.String()              │ }                           │   properties: {                │
│   )                            │                             │     name: {                    │
│ })  	                         │                             │       type: 'string'           │
│                                │                             │     }                          │
│                                │                             │   },                           │
│                                │                             │   required: ['name']           │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Object({        │ type T = {                  │ const T = {                    │
│   name: Type.ReadonlyOptional( │   readonly name?: string    │   type: 'object',              │
│     Type.String()              │ }                           │   properties: {                │
│   )                            │                             │     name: {                    │
│ })  	                         │                             │       type: 'string'           │
│                                │                             │     }                          │
│                                │                             │   }                            │
│                                │                             │ }                              │
│                                │                             │                                │
└────────────────────────────────┴─────────────────────────────┴────────────────────────────────┘
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

```js
┌────────────────────────────────┬─────────────────────────────┬────────────────────────────────┐
│ TypeBox                        │ TypeScript                  │ Extended Schema                │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Constructor([   │ type T = new (              │ const T = {                    │
│   Type.String(),               │  arg0: string,              │   type: 'constructor'          │
│   Type.Number()                │  arg1: number               │   parameters: [{               │
│ ], Type.Boolean())             │ ) => boolean                │     type: 'string'             │
│                                │                             │   }, {                         │
│                                │                             │     type: 'number'             │
│                                │                             │   }],                          │
│                                │                             │   return: {                    │
│                                │                             │     type: 'boolean'            │
│                                │                             │   }                            │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Function([      │ type T = (                  │ const T = {                    │
|   Type.String(),               │  arg0: string,              │   type : 'function',           │
│   Type.Number()                │  arg1: number               │   parameters: [{               │
│ ], Type.Boolean())             │ ) => boolean                │     type: 'string'             │
│                                │                             │   }, {                         │
│                                │                             │     type: 'number'             │
│                                │                             │   }],                          │
│                                │                             │   return: {                    │
│                                │                             │     type: 'boolean'            │
│                                │                             │   }                            │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Uint8Array()    │ type T = Uint8Array         │ const T = {                    │
│                                │                             │   type: 'object',              │
│                                │                             │   specialized: 'Uint8Array'    │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Promise(        │ type T = Promise<string>    │ const T = {                    │
│   Type.String()                │                             │   type: 'promise',             │
│ )                              │                             │   item: {                      │
│                                │                             │     type: 'string'             │
│                                │                             │   }                            │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Undefined()     │ type T = undefined          │ const T = {                    │
│                                │                             │   type: 'object',              │
│                                │                             │   specialized: 'Undefined'     │
│                                │                             │ }                              │
│                                │                             │                                │
├────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ const T = Type.Void()          │ type T = void               │ const T = {                    │
│                                │                             │   type: 'null'                 │
│                                │                             │ }                              │
│                                │                             │                                │
└────────────────────────────────┴─────────────────────────────┴────────────────────────────────┘
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
