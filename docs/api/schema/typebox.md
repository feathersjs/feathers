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

TypeBox provides a set of functions that allow you to compose JSON Schema similar to how you would compose static types with TypeScript. Each function creates a JSON schema fragment which can compose into more complex types. The schemas produced by TypeBox can be passed directly to any JSON Schema-compliant validator, or used to reflect runtime metadata for a type.

### Standard

These are the standard TypeBox types. Each section shows equivalent code in three formats:

- TypeBox
- TypeScript type
- JSON Schema

The following information comes from the TypeBox documentation.  It has been formatted to make it easier to copy/paste examples.

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

##### StringEnum

`StringEnum` is a standalone utility to for specifying an array of allowed string values on a property. It is directly exported from `@feathersjs/typebox`:

```js
// import the module, first
import { StringEnum } from '@feathersjs/typebox'

const T = StringEnum(['crow', 'dove', 'eagle'])
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
