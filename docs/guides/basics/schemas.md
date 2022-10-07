# Schemas and resolvers

In Feathers, schemas and resolvers allow us to define, validate and secure our data model and types.

<img style="margin: 2em;" src="/img/professor-bird-server.svg" alt="Professor bird at work">

As we've briefly seen in the [previous chapter about hooks](./hooks.md), schema validators and resolvers are used with hooks to modify data in the hook context. Similar to how Feathers services are transport independent, schemas and resolvers are database independent. It comes in two main parts:

- [TypeBox](../../api/schema//typebox.md) or [JSON schema](../../api/schema//schema.md) to define a schema. This allows us to do things like:
  - Ensure data is valid and always in the right format
  - Automatically get up to date TypeScript types from schema definitions
  - Create a typed client that can be used in React, Vue etc. apps
  - Automatically generate API documentation
  - Validate query string queries and convert them to the correct type
- [Resolvers](../../api/schema/resolvers.md) - Resolve schema properties based on a context (usually the [hook context](./hooks.md)). This can be used for many different things like:
  - Populating associations
  - Securing queries and e.g. limiting requests to the logged in user
  - Safely hiding sensitive data for external clients
  - Adding read- and write permissions on the property level
  - Hashing passwords and validating dynamic password policies

In this chapter we will look at the generated schemas and resolvers and update them with the information we need for our chat application.

## Feathers schemas

While schemas and resolvers can be used outside of a Feather application, you will usually encounter them in a Feathers context where they come in four kinds:

- `data` schemas and resolvers handle the data from the `create`, `update` and `patch` service methods and can be used to add things like default or calculated values (like the created or updated at date) before saving to the database
- `query` schemas and resolvers validate and convert the query string and can also be used for additional limitations like only allowing a user to see their own data
- `result` schemas and resolvers define the data that is being returned. This is also where associated data would be defined
- `external` resolvers usually use the `result` to return a safe version of the data (e.g. hiding a users password) that can be sent to external clients


## Adding a user avatar

Let's extend our existing users schema to add an `avatar` property so that our users can have a profile image:

<LanguageBlock global-id="ts">

First we need to update the `src/services/users/users.schema.ts` file with the schema property for the avatar and a resolver property that sets a default avatar using [Gravatar]() based on the email address:

</LanguageBlock>
<LanguageBlock global-id="js">

First we need to update the `src/services/users/users.schema.js` file with the schema property for the avatar and a resolver property that sets a default avatar using [Gravatar]() based on the email address:

</LanguageBlock>

```ts{1,15,27-35,76-80}
import crypto from 'crypto'
import { jsonSchema, resolve } from '@feathersjs/schema'
import { Type, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../schemas/validators'

// Schema for the data that is being returned
export const userSchema = Type.Object(
  {
    id: Type.Number(),
    email: Type.String(),
    password: Type.Optional(Type.String()),
    avatar: Type.String()
  },
  { $id: 'User', additionalProperties: false }
)
export type User = Static<typeof userSchema>
export const userResolver = resolve<User, HookContext>({
  properties: {}
})

export const userExternalResolver = resolve<User, HookContext>({
  properties: {
    // The password should never be visible externally
    password: async () => undefined
  }
})

// Schema for the basic data model (e.g. creating new entries)
export const userDataSchema = Type.Pick(userSchema, ['email', 'password'], {
  $id: 'UserData',
  additionalProperties: false
})
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = jsonSchema.getDataValidator(
  userDataSchema,
  dataValidator
)
export const userDataResolver = resolve<User, HookContext>({
  properties: {
    password: passwordHash({ strategy: 'local' }),
    avatar: async (_value, user) => {
      // Gravatar uses MD5 hashes from an email address to get the image
      const hash = crypto.createHash('md5').update(user.email.toLowerCase()).digest('hex')
      // Return the full avatar URL
      return `https://s.gravatar.com/avatar/${hash}?s=60`
    }
  }
})

// Schema for allowed query properties
export const userQuerySchema = Type.Intersect([
  querySyntax(userSchema),
  // Add additional query properties here
  Type.Object({})
])
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = jsonSchema.getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext>({
  properties: {
    // If there is a user (e.g. with authentication), they are only allowed to see their own data
    id: async (value, user, context) => {
      // We want to be able to get a list of all users but
      // only let a user see and modify their own data otherwise
      if (context.params.user && context.method !== 'find') {
        return context.params.user.id
      }

      return value
    }
  }
})
```

## Handling messages

Next we can look at the messages service schema. We want to include the date when the message was sent and the id of the user who sent it.

<LanguageBlock global-id="ts">

Update the `src/services/messages/messages.schema.ts` file like this:

</LanguageBlock>
<LanguageBlock global-id="js">

Update the `src/services/messages/messages.schema.js` file like this:

</LanguageBlock>

```ts{7,13-14,25-32,42,50-53}
import { jsonSchema, resolve } from '@feathersjs/schema'
import { Type, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../schemas/validators'
import { userSchema } from '../users/users.schema'

// Schema for the data that is being returned
export const messageSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String(),
    createdAt: Type.Number(),
    userId: Type.Number(),
    user: Type.Ref(userSchema)
  },
  { $id: 'Message', additionalProperties: false }
)
export type Message = Static<typeof messageSchema>
export const messageResolver = resolve<Message, HookContext>({
  properties: {
    user: async (_value, message, context) => {
      // Associate the user that sent the message
      return context.app.service('users').get(message.userId)
    }
  }
})

// Schema for the basic data model (e.g. creating new entries)
export const messageDataSchema = Type.Pick(messageSchema, ['text'], {
  $id: 'MessageData',
  additionalProperties: false
})
export type MessageData = Static<typeof messageDataSchema>
export const messageDataValidator = jsonSchema.getDataValidator(
  messageDataSchema,
  dataValidator
)
export const messageDataResolver = resolve<Message, HookContext>({
  properties: {
    userId: async (_value, _message, context) => {
      // Associate the record with the id of the authenticated user
      // context.params.user._id if you are using MongoDB
      return context.params.user.id
    },
    createdAt: async () => {
      return Date.now()
    }
  }
})

export const messageExternalResolver = resolve<Message, HookContext>({
  properties: {}
})

// Schema for allowed query properties
export const messageQuerySchema = querySyntax(
  Type.Pick(messageSchema, ['createdAt', 'userId'])
)
export type MessageQuery = Static<typeof messageQuerySchema>
export const messageQueryValidator = jsonSchema.getValidator(
  messageQuerySchema,
  queryValidator
)
export const messageQueryResolver = resolve<MessageQuery, HookContext>({
  properties: {}
})
```
## Creating a migration

Now that our schemas and resolvers are up to date, we also have to update the database with the changes that we made. For SQL databases this is done with migrations. Every change we make in a schema will need its corresponding migration step.

<BlockQuote type="warning">

If you choose MongoDB you do **not** need to create a migration.

</BlockQuote>

Initially, every database service will automatically add a migration that creates a table for it with an `id` and `text` property. Our users service also already added a migration to add the email and password fields for logging in. The migration for the changes we made in this chapter needs to

- Add the `avatar` string field to the `users` table
- Add the `createdAt` number field to the `messages` table
- Add the `userId` number field to the `messages` table and reference it with the `id` in the `users` table 

To create a new migration with the name `chat` run

```
npm run migrate:make -- chat
```

You should see something like

```
Created Migration: /path/to/feathers-chat/migrations/20220622012334_chat.(ts|js)
```

Open that file and update it as follows

```ts{4-11,15-22}
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('avatar')
  })

  await knex.schema.alterTable('messages', (table) => {
    table.bigint('createdAt')
    table.bigint('userId').references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('avatar')
  })

  await knex.schema.alterTable('messages', (table) => {
    table.dropColumn('createdAt')
    table.dropColumn('userId')
  })
}
```

We can run the migrations on the current database with

```
npm run migrate
```

## What's next?

In this chapter we learned about schemas and implemented all the logic we need for our chat application. In the next chapter we will learn about [authentication](./authentication.md) as the last piece to get our chat application working.
