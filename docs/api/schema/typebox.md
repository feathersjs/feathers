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

`querySyntax(definition, extensions, options)` returns a schema to validate the [Feathers query syntax](../databases/querying.md) for all properties in a TypeBox definition.

```ts
import { querySyntax } from '@feathersjs/typebox'

// Schema for allowed query properties
const messageQueryProperties = Type.Pick(messageSchema, ['id', 'text', 'createdAt', 'userId'], {
  additionalProperties: false
})
const messageQuerySchema = querySyntax(messageQueryProperties)

type MessageQuery = Static<typeof messageQuerySchema>
```

Additional special query properties [that are not already included in the query syntax](../databases/querying.md) like `$ilike` can be added like this:

```ts
import { querySyntax } from '@feathersjs/typebox'

// Schema for allowed query properties
const messageQueryProperties = Type.Pick(messageSchema, ['id', 'text', 'createdAt', 'userId'], {
  additionalProperties: false
})
const messageQuerySchema = Type.Intersect(
  [
    // This will additionally allow querying for `{ name: { $ilike: 'Dav%' } }`
    querySyntax(messageQueryProperties, {
      name: {
        $ilike: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object({})
  ],
  { additionalProperties: false }
)
```

To allow additional query properties outside of the query syntax use the intersection type:

```ts
import { querySyntax } from '@feathersjs/typebox'

// Schema for allowed query properties
const messageQueryProperties = Type.Pick(messageSchema, ['id', 'text', 'createdAt', 'userId'], {
  additionalProperties: false
})
const messageQuerySchema = Type.Intersect(
  [
    querySyntax(messageQueryProperties),
    Type.Object({
      isActive: Type.Boolean()
    })
  ],
  { additionalProperties: false }
)

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

## Validating Dates

When validating dates sent from the client, the most spec-compliant solution is to use the [ISO8601 format](https://www.rfc-editor.org/rfc/rfc3339#section-5.6). For example, SQLite date values are strings in the [ISO8601 format](https://www.rfc-editor.org/rfc/rfc3339#section-5.6), which is `YYYY-MM-DDTHH:MM:SS.SSS`. The character between the date and time formats is generally specified as the letter `T`, as in `2016-01-01T10:20:05.123`. For date values, you implement this spec with `Type.String` and not `Type.Date`.

When using AJV you can validate this format with the `ajv-formats` package, which the Feathers CLI installs for you. Using it with `@feathersjs/typebox` looks like this:

```ts
const userSchema = Type.Object(
  {
    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'User', additionalProperties: false }
)
```

See the `@feathersjs/mongodb` docs for more information on [validating dates with MongoDB](/api/databases/mongodb#dates).

## Types

TypeBox provides a set of functions that allow you to compose JSON Schema similar to how you would compose static types with TypeScript. Each function creates a JSON schema fragment which can compose into more complex types. The schemas produced by TypeBox can be passed directly to any JSON Schema-compliant validator, or used to reflect runtime metadata for a type.

### Standard

These are the standard TypeBox types. Each section shows equivalent code in three formats:

- TypeBox
- TypeScript type
- JSON Schema

The following information comes from the TypeBox documentation. It has been formatted to make it easier to copy/paste examples.

#### Primitive Types

Primitive type utilities create schemas for individual values.

##### Any

Creates a schema that will always pass validation. It's the equivalent of TypeScript's [any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any) type.

```js
const T = Type.Any()
```

```js
type T = any
```

```js
const T = {}
```

##### Unknown

Similar to [any](#any), it creates a schema that will always pass validation. It's the equivalent of TypeScript's [unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown) type.

```js
const T = Type.Unknown()
```

```js
type T = unknown
```

```js
const T = {}
```

##### String

Creates a string schema and type. `Type.String` will generally be used for validating dates sent from clients, as well. See [Validating Dates](#validating-dates).

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

###### String Formats Bundled

Strings are the most versatile, serializable type which can be transmitted from clients. Because of their versatility, several custom string formatters are supported, by default, in Feathers CLI-generated applications. [Additional formats](#additional-formats) can be manually enabled.

<hr/>

###### `date-time`

```ts
Type.String({ format: 'date-time' })
```

Validates against the [date-time](https://www.rfc-editor.org/rfc/rfc3339#section-5.6) described in RFC3339/ISO8601, which is the following format:

```
YYYY-MM-DDTHH:MM:SS.SSS+HH:MM
2022-11-30T11:21:44.000-08:00
```

The sections of this format are described as follows:

- **full-date**: `YYYY-MM-DD`
- **partial-time**: `HH:MM:SS.SSS` (where `.SSS` represents optional milliseconds)
- **time-offset**: `+HH:MM` (where `+` can be `-` and which value represents UTC offset or "time zone") **required**

<hr/>

###### `time`

```ts
Type.String({ format: 'time' })
```

Validates against the following format:

```
HH:MM:SS.SSS+HH:MM
11:21:44.000-08:00
```

The sections of this format are described as follows:

- **partial-time**: `HH:MM:SS.SSS` (where `.SSS` represents optional milliseconds)
- **time-offset**: `+HH:MM` (where `+` can be `-` and which value represents UTC offset or "time zone") **optional**

<hr/>

###### `date`

```ts
Type.String({ format: 'date' })
```

Validates against the [full date](https://www.rfc-editor.org/rfc/rfc3339#section-5.6) described in RFC3339/ISO8601, which is the following format:

```
YYYY-MM-DD
2022-11-30
```

<hr/>

###### `email`

```ts
Type.String({ format: 'email' })
```

Validates email addresses against the format specified by [RFC 1034](https://rumkin.com/software/email/rules/).

<hr/>

###### `hostname`

```ts
Type.String({ format: 'hostname' })
```

Validates hostnames against the format specified by [RFC 1034](https://rumkin.com/software/email/rules/).

<hr/>

###### `ipv4`

```ts
Type.String({ format: 'ipv4' })
```

Validates an IPV4-formatted IP Address.

```
0.0.0.0 to 255.255.255.255
```

<hr/>

###### `ipv6`

```ts
Type.String({ format: 'ipv6' })
```

Validates an IPV6-formatted IP Address.

<hr/>

###### `uri`

```ts
Type.String({ format: 'uri' })
```

Validates a full URI.

<hr/>

###### `uri-reference`

```ts
Type.String({ format: 'uri-reference' })
```

<hr/>

###### `uuid`

```ts
Type.String({ format: 'uuid' })
```

Validates a Universally Unique Identifier according to [rfc4122](https://www.rfc-editor.org/rfc/rfc4122).

<hr/>

###### `uri-template`

```ts
Type.String({ format: 'uri-template' })
```

Validates a URI Template according to [rfc6570](https://www.rfc-editor.org/rfc/rfc6570).

<hr/>

###### `json-pointer`

```ts
Type.String({ format: 'json-pointer' })
```

Validates a JSON Pointer, according to [RFC6901](https://www.rfc-editor.org/rfc/rfc6901).

<hr/>

###### `relative-json-pointer`

```ts
Type.String({ format: 'relative-json-pointer' })
```

Validates a Relative JSON Pointer, according to [this draft](https://datatracker.ietf.org/doc/html/draft-luff-relative-json-pointer-00).

<hr/>

###### `regex`

```ts
Type.String({ format: 'regex' })
```

Tests whether a string is a valid regular expression by passing it to RegExp constructor.

<hr/>

###### Additional Formats

The `ajv-formats` package bundled with CLI-generated apps includes additional utilities, listed below, which can be manually enabled by modifying the array of formats in `src/schema/validators.ts`. The additional formats are highlighted in this code example:

```ts{16-25}
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
  'regex',
  'iso-time',
  'iso-date-time',
  'duration',
  'byte',
  'int32',
  'int64',
  'float',
  'double',
  'password',
  'binary',
]
```

Be aware that there is also an [ajv-formats-draft2019 package](https://github.com/luzlab/ajv-formats-draft2019) which can be manually installed. The package allows use of several international formats for urls, domains, and emails. The formats are included in [JSON Schema draft-07](https://json-schema.org/draft-07/json-schema-release-notes.html).

<hr/>

###### iso-time

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'iso-time' })
```

Validates against UTC-based time format:

```
HH:MM:SS.SSSZ
11:21:44.000Z

HH:MM:SSZ
11:21:44Z
```

The sections of this format are described as follows:

- **partial-time**: `HH:MM:SS.SSS` (where `.SSS` represents optional milliseconds)
- **Z**: `Z` (where Z represents UTC time zone, or time offset 00:00)

<hr/>

###### `iso-date-time`

```ts
Type.String({ format: 'iso-date-time' })
```

Validates against the [date-time](https://www.rfc-editor.org/rfc/rfc3339#section-5.6) described in RFC3339/ISO8601, which is the following format:

```
YYYY-MM-DDTHH:MM:SS.SSSZ
2022-11-30T11:21:44.000Z

YYYY-MM-DDTHH:MM:SSZ
2022-11-30T11:21:44Z
```

The sections of this format are described as follows:

- **full-date**: `YYYY-MM-DD`
- **partial-time**: `HH:MM:SS.SSS` (where `.SSS` represents optional milliseconds)
- **Z**: `Z` (where Z represents UTC time zone, or time offset 00:00)

<hr/>

###### Duration

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'duration' })
```

A duration string representing a period of time, as specified in [rfc3339 appendix-A](https://www.rfc-editor.org/rfc/rfc3339#appendix-A) undder the "Durations" heading. Here's an excerpt of the spec.

```
Durations:

dur-second        = 1*DIGIT "S"
dur-minute        = 1*DIGIT "M" [dur-second]
dur-hour          = 1*DIGIT "H" [dur-minute]
dur-time          = "T" (dur-hour / dur-minute / dur-second)
dur-day           = 1*DIGIT "D"
dur-week          = 1*DIGIT "W"
dur-month         = 1*DIGIT "M" [dur-day]
dur-year          = 1*DIGIT "Y" [dur-month]
dur-date          = (dur-day / dur-month / dur-year) [dur-time]

duration          = "P" (dur-date / dur-time / dur-week)
```

<hr/>

###### Byte

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'byte' })
```

Validates base64-encoded data according to the [openApi 3.0.0 specification](https://spec.openapis.org/oas/v3.0.0#data-types).

<hr/>

###### int32

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'int32' })
```

Validates signed (+/-), 32-bit integers according to the [openApi 3.0.0 specification](https://spec.openapis.org/oas/v3.0.0#data-types).

<hr/>

###### int64

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'int64' })
```

Validates signed (+/-), 64-bit integers according to the [openApi 3.0.0 specification](https://spec.openapis.org/oas/v3.0.0#data-types).

<hr/>

###### float

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'float' })
```

Validates floats according to the [openApi 3.0.0 specification](https://spec.openapis.org/oas/v3.0.0#data-types).

<hr/>

###### double

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'double' })
```

Validates doubles according to the [openApi 3.0.0 specification](https://spec.openapis.org/oas/v3.0.0#data-types).

<hr/>

###### password

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'password' })
```

Validates passwords according to the [openApi 3.0.0 specification](https://spec.openapis.org/oas/v3.0.0#data-types).

<hr/>

###### binary

Must be manually enabled. See [Additional Formats](#additional-formats).

```ts
Type.String({ format: 'binary' })
```

Validates a binary string according to the [openApi 3.0.0 specification](https://spec.openapis.org/oas/v3.0.0#data-types).

<hr/>

##### Number

Creates a number schema and type.

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

Creates a number schema and type. The number has to be an integer (not a float).

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

Creates a boolean schema and type.

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

Creates a schema and type only allowing `null`.

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

Creates a schema and type that must match the provided value.

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

These utilities creates schemas and types for objects and arrays.

##### RegEx

Creates a string schema that validates against a regular expression object. The TypeScript type will be `string`.

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

Creates an array of the provided type. You can use any of the utility types to specify what can go in the array, even complex types using [union](#union) and [intersect](#intersect).

```js
const T = Type.Array(Type.Number())
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

Creates an object schema where all properties are required by default. You can use the [Type.Optional](#optional) utility to mark a key as optional.

```js
const T = Type.Object({
  x: Type.Number(),
  y: Type.Number()
})
```

```js
type T = {
  x: number,
  y: number
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
    }
  },
  required: ['x', 'y']
}
```

##### Tuple

Creates an array type with exactly two items matching the specified types.

```js
const T = Type.Tuple([Type.Number(), Type.Number()])
```

```js
type T = [number, number]
```

```js
const T = {
  type: 'array',
  items: [{ type: 'number' }, { type: 'number' }],
  additionalItems: false,
  minItems: 2,
  maxItems: 2
}
```

##### StringEnum

`StringEnum` is a standalone utility to for specifying an array of allowed string values on a property. It is directly exported from `@feathersjs/typebox`:

```js
// import the module, first
import { StringEnum } from '@feathersjs/typebox'

const T = StringEnum(['crow', 'dove', 'eagle'])
// Add additional options
const T = StringEnum(['crow', 'dove', 'eagle'], {
    default: 'crow'
})
```

To obtain the TypeScript type, use the `Static` utility:

```js
import { Static } from '@feathersjs/typebox'

type T = Static<typeof T>
```

```js
const T = {
  enum: ['crow', 'dove', 'eagle']
}
```

##### Enum

<BlockQuote>

For string values, use [StringEnum](#stringenum).

</BlockQuote>

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
    { type: 'number', const: 1 }
  ]
}
```

#### Utility Types

The utility types create types which are derived from other types.

##### KeyOf

Creates a schema for a string that can be any of the keys of a provided `Type.Object`. It's similar to TypeScript's [KeyOf](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html#handbook-content) operator.

```js
const T = Type.KeyOf(
  Type.Object({
    x: Type.Number(),
    y: Type.Number()
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
    { type: 'string', const: 'y' }
  ]
}
```

##### Union

Creates a type which can be one of the types in the provided array. It's the equivalent to using `|` to form a TypeScript [Union](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#unions).

```js
const T = Type.Union([Type.String(), Type.Number()])
```

```js
type T = string | number
```

```js
const T = {
  anyOf: [{ type: 'string' }, { type: 'number' }]
}
```

##### Intersect

Creates an object type by combining two or more other object types.

```js
const T = Type.Intersect([
  Type.Object({
    x: Type.Number()
  }),
  Type.Object({
    y: Type.Number()
  })
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
    y: { type: 'number' }
  },
  required: ['x', 'y']
}
```

##### Never

Creates a type that will never validate if the attribute is present. This is useful if you are allowing [additionalProperties](#additionalproperties) but need to prevent using specific keys.

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
    { type: 'boolean', const: true }
  ]
}
```

##### Record

Creates the JSON Schema equivalent of TypeScript's [Record](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) utility type.

```js
const T = Type.Record(Type.String(), Type.Number())
```

```js
type T = Record<string, number>
```

```js
const T = {
  type: 'object',
  patternProperties: {
    '^.*$': {
      type: 'number'
    }
  }
}
```

##### Partial

Creates a schema for an object where all keys are optional. It's the opposite of [Required](#required), and the JSON Schema equivalent of TypeScript's [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) utility type.

```js
const T = Type.Partial(
  Type.Object({
    x: Type.Number(),
    y: Type.Number()
  })
)
```

```js
type T = Partial<{
  x: number,
  y: number
}>
```

```js
const T = {
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' }
  }
}
```

##### Required

Creates a schema for an object where all keys are required, even ignoring if keys are marked with `Type.Optional`. It's the opposite of [Partial](#partial), and the JSON Schema equivalent of TypeScript's [Required](https://www.typescriptlang.org/docs/handbook/utility-types.html#requiredtype) utility type.

```js
const T = Type.Required(
  Type.Object({
    x: Type.Optional(Type.Number()),
    y: Type.Optional(Type.Number())
  })
)
```

```js
type T = Required<{
  x?: number,
  y?: number
}>
```

```js
const T = {
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' }
  },
  required: ['x', 'y']
}
```

##### Pick

Forms a new object containing only the array of keys provided in the second argument. It's the JSON Schema equivalent of TypeScript's [Pick](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys) utility type.

```js
const T = Type.Pick(
  Type.Object({
    x: Type.Number(),
    y: Type.Number()
  }),
  ['x']
)
```

```js
type T = Pick<
  {
    x: number,
    y: number
  },
  'x'
>
```

```js
const T = {
  type: 'object',
  properties: {
    x: { type: 'number' }
  },
  required: ['x']
}
```

##### Omit

Forms a new object containing all keys except those provided in the second argument. It's the JSON Schema equivalent of TypeScript's [Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) utility type.

```js
const T = Type.Omit(
  Type.Object({
    x: Type.Number(),
    y: Type.Number()
  }),
  ['x']
)
```

```js
type T = Omit<
  {
    x: number,
    y: number
  },
  'x'
>
```

```js
const T = {
  type: 'object',
  properties: {
    y: { type: 'number' }
  },
  required: ['y']
}
```

### Modifiers

TypeBox provides modifiers that can be applied to an objects properties. This allows for `optional` and `readonly` to be applied to that property. The following table illustrates how they map between TypeScript and JSON Schema.

#### Optional

Allows marking a key in [Type.Object](#object) as optional.

```js
const T = Type.Object({
  name: Type.Optional(Type.String())
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
    }
  }
}
```

#### Readonly

Allows marking a key in [Type.Object](#object) as readonly. It's the equivalent of TypeScript's [Readonly](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype) utility type.

```js
const T = Type.Object({
  name: Type.Readonly(Type.String())
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
      type: 'string'
    }
  },
  required: ['name']
}
```

#### ReadonlyOptional

Allows marking a key in [Type.Object](#object) as both [readonly](#readonly) and [optional](#optional).

```js
const T = Type.Object({
  name: Type.ReadonlyOptional(Type.String())
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
      type: 'string'
    }
  }
}
```

### Options by Type

You can pass additional JSON schema options on the last argument of any given type. The [JSON Schema specification](https://json-schema.org/draft/2020-12/json-schema-validation.html#name-a-vocabulary-for-structural) describes options for each data type. Descriptions from the specification are copied here for easy reference.

#### For Numbers

Number types support the following options, which can be used simultaneously.

##### `multipleOf`

The value of "multipleOf" MUST be a number, strictly greater than 0. Values are valid only if division by this keyword's value results in an integer.

```ts
const T = Type.Number({ multipleOf: 2 })
```

##### `maximum`

The value of "maximum" MUST be a number, representing an inclusive upper limit for a numeric instance. If the instance is a number, then this keyword validates only if the instance is less than or exactly equal to "maximum".

```ts
const T = Type.Number({ maximum: 20 })
```

##### `exclusiveMaximum`

The value of "exclusiveMaximum" MUST be a number, representing an exclusive upper limit for a numeric instance. If the instance is a number, then the instance is valid only if it has a value strictly less than (not equal to) "exclusiveMaximum".

```ts
const T = Type.Number({ exclusiveMaximum: 20 })
```

##### `minimum`

The value of "minimum" MUST be a number, representing an inclusive lower limit for a numeric instance. If the instance is a number, then this keyword validates only if the instance is greater than or exactly equal to "minimum".

```ts
const T = Type.Number({ minimum: 20 })
```

##### `exclusiveMinimum`

The value of "exclusiveMinimum" MUST be a number, representing an exclusive lower limit for a numeric instance. If the instance is a number, then the instance is valid only if it has a value strictly greater than (not equal to) "exclusiveMinimum".

```ts
const T = Type.Number({ exclusiveMinimum: 20 })
```

#### For Strings

String types support the following options, which can be used simultaneously.

##### `maxLength`

The value of this keyword MUST be a non-negative integer. A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword. The length of a string instance is defined as the number of its characters as defined by RFC 8259 [RFC8259].

##### `minLength`

The value of this keyword MUST be a non-negative integer. A string instance is valid against this keyword if its length is greater than, or equal to, the value of this keyword. The length of a string instance is defined as the number of its characters as defined by RFC 8259 [RFC8259]. Omitting this keyword has the same behavior as a value of 0.

##### `pattern`

Use `Type.Regex`, instead of this option.

##### With AJV Formats

There are four custom options which are only available for certain formats when using the `ajv-formats` package:

- [formatMinimum](#formatminimum)
- [formatMaximum](#formatmaximum)
- [formatExclusiveMinimum](#formatexclusiveminimum)
- [formatExclusiveMaximum](#formatexclusivemaximum)

The above-listed options are only available when using the following [string formats](#string-formats).

- [date](#date)
- [time](#time)
- [date-time](#date-time)
- [iso-time](#iso-time)
- [iso-date-time](#iso-date-time)

##### `formatMinimum`

Allows defining minimum constraints when the `format` keyword defines ordering (using the compare function in format definition). Available when using [ajv-formats](#with-ajv-formats).

The following example validates that the provided date is on or after November 13, 2022.

```ts
Type.String({ format: 'date', formatMinimum: '2022-11-13' })
```

##### `formatMaximum`

Allows defining maximum constraints when the `format` keyword defines ordering (using the compare function in format definition). Available when using [ajv-formats](#with-ajv-formats).

The following example validates that the provided date is on or before November 13, 2022.

```ts
Type.String({ format: 'date', formatMaximum: '2022-11-13' })
```

##### `formatExclusiveMinimum`

Allows defining exclusive minimum constraints when the `format` keyword defines ordering (using the compare function in format definition). Available when using [ajv-formats](#with-ajv-formats).

The following example validates that the provided date is after (and not on) November 13, 2022.

```ts
Type.String({ format: 'date', formatExclusiveMinimum: '2022-11-13' })
```

##### `formatExclusiveMaximum`

Allows defining exclusive maximum constraints when the `format` keyword defines ordering (using the compare function in format definition). Available when using [ajv-formats](#with-ajv-formats).

The following example validates that the provided date is before (and not on) November 13, 2022.

```ts
Type.String({ format: 'date', formatExclusiveMaximum: '2022-11-13' })
```

#### For Arrays

Array types support the following options, which can be used simultaneously.

##### `maxItems`

The value of this keyword MUST be a non-negative integer. An array instance is valid against "maxItems" if its size is less than, or equal to, the value of this keyword.

##### `minItems`

The value of this keyword MUST be a non-negative integer. An array instance is valid against "minItems" if its size is greater than, or equal to, the value of this keyword. Omitting this keyword has the same behavior as a value of 0.

##### `uniqueItems`

The value of this keyword MUST be a boolean. If this keyword has boolean value false, the instance validates successfully. If it has boolean value true, the instance validates successfully if all of its elements are unique. Omitting this keyword has the same behavior as a value of false.

##### `maxContains`

The value of this keyword MUST be a non-negative integer.

If "contains" is not present within the same schema object, then this keyword has no effect.

An instance array is valid against "maxContains" in two ways, depending on the form of the annotation result of an adjacent "contains" [json-schema] keyword. The first way is if the annotation result is an array and the length of that array is less than or equal to the "maxContains" value. The second way is if the annotation result is a boolean "true" and the instance array length is less than or equal to the "maxContains" value.

##### `minContains`

The value of this keyword MUST be a non-negative integer.

If "contains" is not present within the same schema object, then this keyword has no effect.

An instance array is valid against "minContains" in two ways, depending on the form of the annotation result of an adjacent "contains" [json-schema] keyword. The first way is if the annotation result is an array and the length of that array is greater than or equal to the "minContains" value. The second way is if the annotation result is a boolean "true" and the instance array length is greater than or equal to the "minContains" value.

A value of 0 is allowed, but is only useful for setting a range of occurrences from 0 to the value of "maxContains". A value of 0 causes "minContains" and "contains" to always pass validation (but validation can still fail against a "maxContains" keyword).

Omitting this keyword has the same behavior as a value of 1.

#### For Objects

Array types support the following options, which can be used simultaneously.

##### `additionalProperties`

Specifies if keys other than the ones specified in the schema are allowed to be present in the object.

##### `maxProperties`

The value of this keyword MUST be a non-negative integer. An object instance is valid against "maxProperties" if its number of properties is less than, or equal to, the value of this keyword.

##### `minProperties`

The value of this keyword MUST be a non-negative integer. An object instance is valid against "minProperties" if its number of properties is greater than, or equal to, the value of this keyword. Omitting this keyword has the same behavior as a value of 0.

##### `required`

All TypeBox types are required unless you wrap them in [Type.Optional](#optional), so you don't need to use this option, manually.

##### `dependentRequired`

The value of this keyword MUST be an object. Properties in this object, if any, MUST be arrays. Elements in each array, if any, MUST be strings, and MUST be unique.

This keyword specifies properties that are required if a specific other property is present. Their requirement is dependent on the presence of the other property.

Validation succeeds if, for each name that appears in both the instance and as a name within this keyword's value, every item in the corresponding array is also the name of a property in the instance.

Omitting this keyword has the same behavior as an empty object.

### Extended

In addition to JSON schema types, TypeBox provides several extended types that allow for the composition of `function` and `constructor` types. These additional types are not valid JSON Schema and will not validate using typical JSON Schema validation. However, these types can be used to frame JSON schema and describe callable interfaces that may receive JSON validated data. Since these are nonstandard types, most applications will not need them. Consider using the [Standard Types](#standard), instead, as using these types may make it difficult to upgrade your application in the future.

#### Extended Configuration

Utilities in this section require updating `src/schemas/validators.ts` to the Extended Ajv Configuration, as shown here: 

```ts
import { TypeGuard } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import addFormats from 'ajv-formats'
import type { Options } from 'ajv'
import Ajv from 'ajv'

function schemaOf(schemaOf: string, value: unknown, schema: unknown) {
  switch (schemaOf) {
    case 'Constructor':
      return TypeGuard.IsConstructor(schema) && Value.Check(schema, value) // not supported
    case 'Function':
      return TypeGuard.IsFunction(schema) && Value.Check(schema, value) // not supported
    case 'Date':
      return TypeGuard.IsDate(schema) && Value.Check(schema, value)
    case 'Promise':
      return TypeGuard.IsPromise(schema) && Value.Check(schema, value) // not supported
    case 'Uint8Array':
      return TypeGuard.IsUint8Array(schema) && Value.Check(schema, value)
    case 'Undefined':
      return TypeGuard.IsUndefined(schema) && Value.Check(schema, value) // not supported
    case 'Void':
      return TypeGuard.IsVoid(schema) && Value.Check(schema, value)
    default:
      return false
  }
}

export function createAjv(options: Options = {}) {
  return addFormats(new Ajv(options), [
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
    'regex',
  ])
  .addKeyword({ type: 'object', keyword: 'instanceOf', validate: schemaOf })
  .addKeyword({ type: 'null', keyword: 'typeOf', validate: schemaOf })
  .addKeyword('exclusiveMinimumTimestamp')
  .addKeyword('exclusiveMaximumTimestamp')
  .addKeyword('minimumTimestamp')
  .addKeyword('maximumTimestamp')
  .addKeyword('minByteLength')
  .addKeyword('maxByteLength')
}

export const dataValidator: Ajv = createAjv({})
export const queryValidator: Ajv = createAjv({ coerceTypes: true })
```

If you see an error stating `Error: strict mode: unknown keyword: "instanceOf"`, it's likely because you need to extend your configuration, as shown above.

#### Constructor

Verifies that the value is a constructor with typed arguments and return value. Requires [Extended Ajv Configuration](#extended-configuration).

```js
const T = Type.Constructor([Type.String(), Type.Number()], Type.Boolean())
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

Verifies that the value is a function with typed arguments and return value. Requires [Extended Ajv Configuration](#extended-configuration).

```js
const T = Type.Function([Type.String(), Type.Number()], Type.Boolean())
```

```js
type T = ({
  arg0: string,
  arg1: number
}) => boolean
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

#### Promise

Verifies that the value is an instanceof Promise which resolves to the provided type. Requires [Extended Ajv Configuration](#extended-configuration).

```js
const T = Type.Promise(Type.String())
```

```js
type T = Promise<string>
```

```js
const T = {
  type: 'promise',
  item: { type: 'string' }
}
```

#### Uint8Array

Verifies that the value is an instanceof Uint8Array. Requires [Extended Ajv Configuration](#extended-configuration).

```js
const T = Type.Uint8Array()
```

```js
type T = Uint8Array
```

```js
const T = {
  type: 'object',
  instanceOf: 'Uint8Array'
}
```

#### Date

Verifies that the value is an instanceof Date. This is likely not the validator to use for storing dates in a database. See [Validating Dates](#validating-dates). Requires [Extended Ajv Configuration](#extended-configuration).

```js
const T = Type.Date()
```

```js
type T = Date
```

```js
const T = {
  type: 'object',
  instanceOf: 'Date'
}
```

#### Undefined

Verifies that the value is `undefined`. Requires [Extended Ajv Configuration](#extended-configuration).

```js
const T = Type.Undefined()
```

```js
type T = undefined
```

```js
const T = {
  type: 'object',
  specialized: 'Undefined'
}
```


#### Symbol

Verifies that the value is of type `Symbol`. Requires [Extended Ajv Configuration](#extended-configuration).

```js
const T = Type.Symbol()
```

```js
type T = symbol
```

```js
const T = {
  type: 'null',
  typeOf: 'Symbol'
}
```

#### BigInt

Verifies that the value is of type `BigInt`. Requires [Extended Ajv Configuration](#extended-configuration).

```js
const T = Type.BigInt()
```

```js
type T = bigint
```

```js
const T = {
  type: 'null',
  typeOf: 'BigInt'
}
```

#### Void

Verifies that the value is `null`. Requires [Extended Ajv Configuration](#extended-configuration).

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

For a more detailed example see the [result and data schema](#result-and-data-schemas) section.
