---
outline: deep
---

# Service Schemas and Resolvers

The `<service>.schemas` file contains the [schemas and resolvers](../../api/schema/index.md) for this service.

<BlockQuote type="info">

The examples on this page are using [TypeBox](../../api/schema/typebox.md). For more information on plain JSON schema see the [JSON schema API documentation](../../api/schema/schema.md).

</BlockQuote>

## Patterns

There a four main types of schemas and resolvers. The schemas, resolvers and types are declared as follows:

```ts
// The schema definition
export const nameSchema = Type.Object({
  text: Type.String()
})
// The TypeScript type inferred from the schema
export type Name = Static<typeof nameSchema>
// The validator for the schema
export const nameValidator = getValidator(nameSchema, dataValidator)
// The resolver for the schema
export const nameResolver = resolve<Name, HookContext>({})
```

## Main schema and resolvers

This schema defines the main data model of all properties and is normally the shape of the data that is returned. This includes database properties as well as associations and other computed properties.

```ts
// Main data model schema
export const messageSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'Message', additionalProperties: false }
)
export type Message = Static<typeof messageSchema>
export const messageValidator = getValidator(messageSchema, dataValidator)
export const messageResolver = resolve<Message, HookContext>({})
```

## External Resolvers

The external resolver defines the data that is sent to a client and is often use to e.g. hide protected properties they should not see:

```ts
export const messagesExternalResolver = resolve<Messages, HookContext>({
  someSecretProperty: async () => undefined
})
```

## Data schema and resolvers

The data schema validates the data when creating a new entry calling [service.create](../../api/services.md#createdata-params). It usually picks its properties from the [main schema](#main-schemas-and-resolvers) but can be changed to whatever is needed.

```ts
// Schema for creating new entries
export const messageDataSchema = Type.Pick(messageSchema, ['text'], {
  $id: 'MessageData'
})
export type MessageData = Static<typeof messageDataSchema>
export const messageDataValidator = getValidator(messageDataSchema, dataValidator)
export const messageDataResolver = resolve<Message, HookContext>({})
```

## Patch schema and Resolvers

The patch schema is used for updating existing entries calling [service.patch](../../api/services.md#patchid-data-params). This is often different then the data schema for new entries and by default is a partial of the [main schema](#main-schemas-and-resolvers).

```ts
// Schema for updating existing entries
export const messagePatchSchema = Type.Partial(messageSchema, {
  $id: 'MessagePatch'
})
export type MessagePatch = Static<typeof messagePatchSchema>
export const messagePatchValidator = getValidator(messagePatchSchema, dataValidator)
export const messagePatchResolver = resolve<Message, HookContext>({})
```

## Query Schema and Resolvers

The query schema defines what can be sent in queries in [params.query](../../api/services.md#params) and also converts strings to the correct type.

```ts
// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(messageSchema, ['id', 'text', 'createdAt', 'userId'])
export const messageQuerySchema = Type.Intersect(
  [
    querySyntax(messageQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MessageQuery = Static<typeof messageQuerySchema>
export const messageQueryValidator = getValidator(messageQuerySchema, queryValidator)
export const messageQueryResolver = resolve<MessageQuery, HookContext>({})
```

To add additional operators like `$like` see the [querySyntax](../../api/schema/typebox.md#querysyntax) documentation. You can also add your own query parameters in the `Type.Object({}, { additionalProperties: false })` definition.

<BlockQuote type="warning" label="Important">

Note that references (`Type.Ref`) can not be used in a query schema. Association querying is usually done by dot separated properties which have to be added manually in [MongoDB](../../api/databases/mongodb.md#querying) and [SQL](../../api/databases/knex.md#associations).

</BlockQuote>
