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

// Resolver for the data that is being returned
export const commentsResultResolver = resolve<commentsResult, HookContext>({
  schema: commentsResultSchema,
  validate: false,
  properties: {
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

export const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
  schemas: []
})
addFormats(ajv)

export const ajvNoCoerce = new Ajv({
  coerceTypes: false,
  useDefaults: true,
  schemas: []
})
addFormats(ajvNoCoerce)

// Add convert keyword for "date" and "date-time" string formats
ajv.addKeyword({
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
})

// Add `objectid` format
ajv.addFormat('objectid', {
  type: 'string',
  validate: (id: string | ObjectId) => {
    if (ObjectId.isValid(id)) {
      if (String(new ObjectId(id)) === id) return true
      return false
    }
    return false
  }
})
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
