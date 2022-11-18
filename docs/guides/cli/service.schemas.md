---
outline: deep
---

# Service Schemas and Resolvers

The `<service>.schemas` file contains the [schemas and resolvers](../../api/schema/index.md) for this service.

<BlockQuote type="info">

The examples on this page are using [TypeBox](../../api/schema/typebox.md). For more information on plain JSON schema see the [JSON schema API documentation](../../api/schema/schema.md).

</BlockQuote>

## Patterns

There a four main types of schemas and resolvers. The schemas, resolvers and TypeScript types are declared as follows:

```ts
// The schema definition
export const nameSchema = Type.Object({
  text: Type.String()
})
// The TypeScript type inferred from the schema
export type Name = Static<typeof nameSchema>
// The resolver for the schema
export const nameResolver = resolve<Name, HookContext>({
  properties: {}
})
// The validator if it is a schema for data
export const nameValidator = getDataValidator(nameSchema, dataValidator)
```

## Main Schemas and Resolvers

This schema defines the main data model of all properties and is normally the shape of the data that is returned. This includes database properties as well as associations and other computed properties.

```ts
// Main data model schema https://dove.feathersjs.com/guides/cli/schemas-and-resolvers.html#main-schemas-and-resolvers
export const messagesSchema = Type.Object(
  {
    _id: objectId,
    text: Type.String()
  },
  { $id: 'Messages', additionalProperties: false }
)
export type Messages = Static<typeof messagesSchema>
export const messagesResolver = resolve<Messages, HookContext>({
  properties: {}
})
```

## External Resolvers

```ts
// External resolvers https://dove.feathersjs.com/guides/cli/schemas-and-resolvers.html#external-resolvers
export const messagesExternalResolver = resolve<Messages, HookContext>({
  properties: {}
})
```

## Data Schema and Resolvers

```ts
// Schema for creating new entries https://dove.feathersjs.com/guides/cli/schemas-and-resolvers.html#data-schema-and-resolvers
export const messagesDataSchema = Type.Pick(messagesSchema, ['string'], {
  $id: 'MessagesData',
  additionalProperties: false
})
export type MessagesData = Static<typeof messagesDataSchema>
export const messagesDataValidator = getDataValidator(messagesDataSchema, dataValidator)
export const messagesDataResolver = resolve<Messages, HookContext>({
  properties: {}
})
```

### create, patch and update

## Query Schema and Resolvers

```ts
// Schema for allowed query properties https://dove.feathersjs.com/guides/cli/schemas-and-resolvers.html#query-schema-and-resolvers
export const messagesQueryProperties = Type.Pick(messagesSchema, ['_id', 'name'], {
  additionalProperties: false
})
export const messagesQuerySchema = querySyntax(messagesQueryProperties)
export type MessagesQuery = Static<typeof messagesQuerySchema>
export const messagesQueryValidator = getValidator(messagesQuerySchema, queryValidator)
export const messagesQueryResolver = resolve<MessagesQuery, HookContext>({
  properties: {}
})
```
