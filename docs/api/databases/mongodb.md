---
outline: deep
---

# MongoDB Adapter

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/mongodb.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/mongodb)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/mongodb/CHANGELOG.md)

</Badges>

A [Feathers](https://feathersjs.com) service adapter MongoDB.

```bash
$ npm install --save @feathersjs/mongodb
```

<BlockQuote>

> The MongoDB adapter implements the [common database adapter API](./common) and [querying syntax](./querying).

</BlockQuote>

## API

### `service([options])`

## Validating MongoDB Data

### Using Resolvers

The simplest way to convert ObjectIds is to make a resolver.

```ts
import { ObjectId } from 'mongodb'

// Resolver for the basic data model (e.g. creating new entries)
export const commentsDataResolver = resolve<commentsData, HookContext>({
  schema: commentsDataSchema,
  validate: false,
  properties: {
    text: { type: 'string' },
    userId: async (value) => {
      return value ? new ObjectId(value) : value
    }
  }
})
```

### Using a Custom AJV Instance

All [Feathers schemas](/api/schema/schema) share an implicit AJV instance by default.

It's possible to validate MongoDB ObjectIds and dates with AJV, as well. This is more complicated than using resolvers, but can also handle the full query syntax. You can create a custom AJV instance with extra formatters attached.

#### Custom AJV Instance

Here's an example of a custom AJV instance, which could be placed in `src/schemas/ajv.ts` and referenced by all other services.

```ts
import Ajv, { AnySchemaObject } from 'ajv'
import addFormats from 'ajv-formats'
import { ObjectId } from 'mongodb'

export { Infer, validateData, validateQuery, schema, queryProperty } from '@feathersjs/schema'

// Reusable `convert` keyword.
const keywordConvert = {
  keyword: 'convert',
  type: 'string',
  compile(schemaVal: boolean, parentSchema: AnySchemaObject) {
    if (!schemaVal) return () => true

    // Update date-time string to Date object
    if (['date-time', 'date'].includes(parentSchema.format)) {
      return function (value: string, obj: any) {
        const { parentData, parentDataProperty } = obj
        console.log(value)
        parentData[parentDataProperty] = new Date(value)
        return true
      }
    }
    // Update objectid string to ObjectId
    else if (parentSchema.format === 'objectid') {
      return function (value: string, obj: any) {
        const { parentData, parentDataProperty } = obj
        // Update date-time string to Date object
        parentData[parentDataProperty] = new ObjectId(value)
        return true
      }
    }
    return () => true
  }
} as const

// Reusable `ObjectId` Formatter
const formatObjectId = {
  type: 'string',
  validate: (id: string | ObjectId) => {
    if (ObjectId.isValid(id)) {
      if (String(new ObjectId(id)) === id) return true
      return false
    }
    return false
  }
} as const

// Create a custom AJV
export const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
  schemas: []
})
addFormats(ajv)
ajv.addKeyword(keywordConvert)
ajv.addFormat('objectid', formatObjectId)

// Create a custom AJV instance that doesn't coerce types
export const ajvNoCoerce = new Ajv({
  coerceTypes: false,
  useDefaults: true,
  schemas: []
})
addFormats(ajvNoCoerce)
ajv.addKeyword(keywordConvert)
ajv.addFormat('objectid', formatObjectId)
```

#### Pass the Custom AJV Instance to `schema`

Once created, all service schema files should use the custom AJV instance. Here's an example:

```ts
// Schema for the data that is being returned
export const connectionsResultSchema = schema(
  {
    $id: 'ConnectionsResult',
    type: 'object',
    additionalProperties: false,
    required: ['_id'],
    properties: {
      ...common,
      _id: {
        anyOf: [
          { type: 'string', format: 'objectid', convert: true },
          { type: 'object' } // ObjectId
        ]
      },
      createdAt: { type: 'string', format: 'date-time', convert: true }
    }
  } as const,
  ajv
)
```

## Common Pitfalls

Here are a couple of errors you might run into while using validators.

### unknown keyword: "convert"

You'll see an error like `"Error: strict mode: unknown keyword: "convert"` in a few scenarios:

- You fail to [Pass the Custom AJV Instance to every `schema`](#pass-the-custom-ajv-instance-to-schema). If you're using a custom AJV instance, be sure to provide it to **every** place where you call `schema()`.
- You try to use custom keywords in your schema without registering them, first.
- You make a typo in your schema. For example, it's common to forget to accidentally mis-document arrays and collapse the item `properties` up one level.

### unknown format "date-time"

You'll see an error like `Error: unknown format "date-time" ignored in schema at path "#/properties/createdAt"` in a few scenarios.

- You're attempting to use a formatter not built into AJV.
- You fail to [Pass the Custom AJV Instance to every `schema`](#pass-the-custom-ajv-instance-to-schema). If you're using a custom AJV instance, be sure to provide it to **every** place where you call `schema()`.
