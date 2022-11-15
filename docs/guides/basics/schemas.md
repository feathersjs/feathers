# Schemas and resolvers

In Feathers, schemas and resolvers allow us to define, validate and secure our data model and types.

<img style="margin: 2em;" src="/img/professor-bird-server.svg" alt="Professor bird at work">

As we've briefly seen in the [previous chapter about hooks](./hooks.md), there were a few hooks registered already to validate schemas and resolve data. Schema validators and resolvers are used with those hooks to modify data in the hook context. Similar to how Feathers services are transport independent, schemas and resolvers are database independent. It comes in two main parts:

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

- **Result** schemas and resolvers that define the data that is being returned. This is also where associated data would be declared
- **Data** schemas and resolvers handle the data from the `create`, `update` and `patch` service methods and can be used to add things like default or calculated values (like the created or updated at date) before saving to the database
- **Query** schemas and resolvers validate and convert the query string and can also be used for additional limitations like only allowing a user to see and modify their own data
- **External** resolvers that return a safe version of the data (e.g. hiding a users password) that can be sent to external clients

## Adding a user avatar

Let's extend our existing users schema to add an `avatar` property so that our users can have a profile image.

<LanguageBlock global-id="ts">

First we need to update the `src/services/users/users.schema.ts` file with the schema property for the avatar and a resolver property that sets a default avatar using Gravatar based on the email address:

</LanguageBlock>
<LanguageBlock global-id="js">

First we need to update the `src/services/users/users.schema.js` file with the schema property for the avatar and a resolver property that sets a default avatar using Gravatar based on the email address:

</LanguageBlock>

<DatabaseBlock global-id="sql">

```ts{1,16-17,36,47-57,70-74}
import crypto from 'crypto'
import { resolve } from '@feathersjs/schema'
import { Type, getDataValidator, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../schemas/validators'

// Main data model schema
export const userSchema = Type.Object(
  {
    id: Type.Number(),
    email: Type.String(),
    password: Type.Optional(Type.String()),
    githubId: Type.Optional(Type.Number()),
    avatar: Type.Optional(Type.String())
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
export const userDataSchema = Type.Pick(
  userSchema,
  ['email', 'password', 'githubId', 'avatar'],
  {
    $id: 'UserData',
    additionalProperties: false
  }
)
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getDataValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext>({
  properties: {
    password: passwordHash({ strategy: 'local' }),
    avatar: async (value, user) => {
      // If the user passed an avatar image, use it
      if (value !== undefined) {
        return value
      }

      // Gravatar uses MD5 hashes from an email address to get the image
      const hash = crypto.createHash('md5').update(user.email.toLowerCase()).digest('hex')
      // Return the full avatar URL
      return `https://s.gravatar.com/avatar/${hash}?s=60`
    }
  }
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['id', 'email', 'githubId'])
export const userQuerySchema = querySyntax(userQueryProperties)
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext>({
  properties: {
    // If there is a user (e.g. with authentication), they are only allowed to see their own data
    id: async (value, user, context) => {
      // We want to be able to get a list of all users but
      // only let a user modify their own data otherwise
      if (context.params.user && context.method !== 'find') {
        return context.params.user.id
      }

      return value
    }
  }
})
```

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

```ts{1,16-17,36,47-57,70-74}
import crypto from 'crypto'
import { resolve } from '@feathersjs/schema'
import { Type, getDataValidator, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../schemas/validators'

// Main data model schema
export const userSchema = Type.Object(
  {
    _id: Type.String(),
    email: Type.String(),
    password: Type.Optional(Type.String()),
    githubId: Type.Optional(Type.Number()),
    avatar: Type.Optional(Type.String())
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
export const userDataSchema = Type.Pick(userSchema, ['email', 'password', 'githubId', 'avatar'], {
  $id: 'UserData',
  additionalProperties: false
})
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getDataValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext>({
  properties: {
    password: passwordHash({ strategy: 'local' }),
    avatar: async (value, user) => {
      // If the user passed an avatar image, use it
      if (value !== undefined) {
        return value
      }

      // Gravatar uses MD5 hashes from an email address to get the image
      const hash = crypto.createHash('md5').update(user.email.toLowerCase()).digest('hex')
      // Return the full avatar URL
      return `https://s.gravatar.com/avatar/${hash}?s=60`
    }
  }
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['_id', 'email', 'githubId'])
export const userQuerySchema = querySyntax(userQueryProperties)
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext>({
  properties: {
    // If there is a user (e.g. with authentication), they are only allowed to see their own data
    _id: async (value, user, context) => {
      // We want to be able to get a list of all users but
      // only let a user modify their own data otherwise
      if (context.params.user && context.method !== 'find') {
        return context.params.user._id
      }

      return value
    }
  }
})
```

</DatabaseBlock>

## Handling messages

Next we can look at the messages service schema. We want to include the date when the message was created as `createdAt` and the id of the user who sent it as `userId`. When we get a message back, we also want to populate the `user` with the user data from `userId` so that we can show e.g. the user image and email.

<LanguageBlock global-id="ts">

Update the `src/services/messages/messages.schema.ts` file like this:

</LanguageBlock>
<LanguageBlock global-id="js">

Update the `src/services/messages/messages.schema.js` file like this:

</LanguageBlock>

<DatabaseBlock global-id="sql">

```ts{7,14-16,23-26,43-49,56,66-74}
import { resolve } from '@feathersjs/schema'
import { Type, getDataValidator, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../schemas/validators'
import { userSchema } from '../users/users.schema'

// Main data model schema
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

export const messageExternalResolver = resolve<Message, HookContext>({
  properties: {}
})

// Schema for creating new entries
export const messageDataSchema = Type.Pick(messageSchema, ['text'], {
  $id: 'MessageData',
  additionalProperties: false
})
export type MessageData = Static<typeof messageDataSchema>
export const messageDataValidator = getDataValidator(messageDataSchema, dataValidator)
export const messageDataResolver = resolve<Message, HookContext>({
  properties: {
    userId: async (_value, _message, context) => {
      // Associate the record with the id of the authenticated user
      return context.params.user.id
    },
    createdAt: async () => {
      return Date.now()
    }
  }
})

// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(
  messageSchema,
  ['id', 'text', 'createdAt', 'userId'],
  {
    additionalProperties: false
  }
)
export const messageQuerySchema = querySyntax(messageQueryProperties)
export type MessageQuery = Static<typeof messageQuerySchema>
export const messageQueryValidator = getValidator(messageQuerySchema, queryValidator)
export const messageQueryResolver = resolve<MessageQuery, HookContext>({
  properties: {
    userId: async (value, user, context) => {
      // We want to be able to get a list of all messages but
      // only let a user access their own messages otherwise
      if (context.params.user && context.method !== 'find') {
        return context.params.user.id
      }

      return value
    }
  }
})
```

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

```ts{7,14-16,23-26,43-49,56,66-74}
import { resolve } from '@feathersjs/schema'
import { Type, getDataValidator, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../schemas/validators'
import { userSchema } from '../users/users.schema'

// Main data model schema
export const messageSchema = Type.Object(
  {
    _id: Type.String(),
    text: Type.String(),
    createdAt: Type.Number(),
    userId: Type.String(),
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

export const messageExternalResolver = resolve<Message, HookContext>({
  properties: {}
})

// Schema for creating new entries
export const messageDataSchema = Type.Pick(messageSchema, ['text'], {
  $id: 'MessageData',
  additionalProperties: false
})
export type MessageData = Static<typeof messageDataSchema>
export const messageDataValidator = getDataValidator(messageDataSchema, dataValidator)
export const messageDataResolver = resolve<Message, HookContext>({
  properties: {
    userId: async (_value, _message, context) => {
      // Associate the record with the id of the authenticated user
      return context.params.user._id
    },
    createdAt: async () => {
      return Date.now()
    }
  }
})

// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(messageSchema, ['_id', 'text', 'createdAt', 'userId'], {
  additionalProperties: false
})
export const messageQuerySchema = querySyntax(messageQueryProperties)
export type MessageQuery = Static<typeof messageQuerySchema>
export const messageQueryValidator = getValidator(messageQuerySchema, queryValidator)
export const messageQueryResolver = resolve<MessageQuery, HookContext>({
  properties: {
    userId: async (value, user, context) => {
      // We want to be able to get a list of all messages but
      // only let a user access their own messages otherwise
      if (context.params.user && context.method !== 'find') {
        return context.params.user._id
      }

      return value
    }
  }
})
```

</DatabaseBlock>

## Creating a migration

<DatabaseBlock global-id="sql">

Now that our schemas and resolvers have everything we need, we also have to update the database with those changes. For SQL databases this is done with migrations. Migrations are a best practise for SQL databases to roll out and undo changes to the data model. Every change we make in a schema will need its corresponding migration step.

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
import type { Knex } from 'knex'

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

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

<BlockQuote type="tip">

For MongoDB no migrations are necessary.

</BlockQuote>

</DatabaseBlock>

## What's next?

In this chapter we learned about schemas and implemented all the things we need for our chat application. In the next chapter we will learn about [authentication](./authentication.md) and add a "Login with GitHub".
