---
outline: deep
---

# Service Schemas and Resolvers

Give a tour of the generated schemas and resolvers for a  service.

## Main Schemas and Resolvers

```ts
// Main data model schema https://dove.feathersjs.com/guides/cli/schemas-and-resolvers.html#main-schemas-and-resolvers
export const messagesSchema = Type.Object(
  {
    _id: objectId,
    text: Type.String(),
  },
  { $id: 'Messages', additionalProperties: false },
)
export type Messages = Static<typeof messagesSchema>
export const messagesResolver = resolve<Messages, HookContext>({
  properties: {},
})
```

## External Resolvers

```ts
// External resolvers https://dove.feathersjs.com/guides/cli/schemas-and-resolvers.html#external-resolvers
export const messagesExternalResolver = resolve<Messages, HookContext>({
  properties: {},
})
```

## Data Schema and Resolvers

```ts
// Schema for creating new entries https://dove.feathersjs.com/guides/cli/schemas-and-resolvers.html#data-schema-and-resolvers
export const messagesDataSchema = Type.Pick(messagesSchema, ['string'], {
  $id: 'MessagesData',
  additionalProperties: false,
})
export type MessagesData = Static<typeof messagesDataSchema>
export const messagesDataValidator = getDataValidator(messagesDataSchema, dataValidator)
export const messagesDataResolver = resolve<Messages, HookContext>({
  properties: {},
})
```

## Query Schema and Resolvers

```ts
// Schema for allowed query properties https://dove.feathersjs.com/guides/cli/schemas-and-resolvers.html#query-schema-and-resolvers
export const messagesQueryProperties = Type.Pick(messagesSchema, ['_id', 'name'], { additionalProperties: false })
export const messagesQuerySchema = querySyntax(messagesQueryProperties)
export type MessagesQuery = Static<typeof messagesQuerySchema>
export const messagesQueryValidator = getValidator(messagesQuerySchema, queryValidator)
export const messagesQueryResolver = resolve<MessagesQuery, HookContext>({
  properties: {},
})

```