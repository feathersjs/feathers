# Schemas and resolvers

In Feathers, schemas and resolvers allow us to define, validate and secure our data model and types.

<img style="margin: 2em;" src="/img/professor-bird-server.svg" alt="Professor bird at work">

As we've briefly seen in the [previous chapter about hooks](./hooks), there were a few hooks registered already to validate schemas and resolve data. Schema validators and resolvers are used with those hooks to modify data in the hook context. Similar to how Feathers services are transport independent, schemas and resolvers are database independent. It comes in two main parts:

- [TypeBox](../../api/schema/typebox) or [JSON schema](../../api/schema/schema) to define a schema. This allows us to do things like:
  - Ensure data is valid and always in the right format
  - Automatically get up to date TypeScript types from schema definitions
  - Create a typed client that can be used in React, Vue etc. apps
  - Automatically generate API documentation
  - Validate query string filters and convert them to the correct types
- [Resolvers](../../api/schema/resolvers) - Resolve schema properties based on a context (usually the [hook context](./hooks)). This can be used for many different things like:
  - Populating associations
  - Securing queries and limiting the type of requests the logged in user can perform
  - Safely hiding sensitive data for external clients
  - Adding read and write permissions on the property field level
  - Hashing passwords and validating dynamic password policies

In this chapter we will look at the generated schemas and resolvers and update them with the information we need for our chat application.

## Feathers schemas

While schemas and resolvers can be used outside of a Feathers application, you will usually encounter them in a Feathers context where they come in four kinds:

- **Result** schemas and resolvers that define the data that is being returned. This is also where associated data would be fetched
- **Data** schemas and resolvers handle the data from a `create`, `update`, `patch`, or custom service method and can be used to add/replace things like default or calculated values (e.g. the `createdAt` or `updatedAt` date) before saving it to the database
- **Query** schemas and resolvers validate and convert the query string and can also be used for additional limitations like only allowing a user to see and modify their own data
- **External** resolvers return a safe version of the data (by e.g. hiding a users password) that can be sent to external clients

While it may initially look like a bit more code, schema driven development is a great way to have the data models and how data is modified in a single place.

## Adding a user avatar

Let's extend our existing users schema to add an `avatar` property so that our users can have a profile image.

First we need to update the `src/services/users/users.schema.ts` file with the schema property for the avatar and a resolver property that sets a default avatar using the [Gravatar](https://en.gravatar.com/) based on the email address:

```ts{2,17-18,34,44-54,68,82-86}
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import crypto from 'crypto'
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { passwordHash } from '@feathersjs/authentication-local'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

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
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext>({})

export const userExternalResolver = resolve<User, HookContext>({
  // The password should never be visible externally
  password: async () => undefined
})

// Schema for creating new users
export const userDataSchema = Type.Pick(
  userSchema,
  ['email', 'password', 'githubId', 'avatar'],
  {
    $id: 'UserData',
    additionalProperties: false
  }
)
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext>({
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
})

// Schema for updating existing users
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve<User, HookContext>({
  password: passwordHash({ strategy: 'local' })
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['id', 'email', 'githubId'])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext>({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  id: async (value, user, context) => {
    // We want to be able to get a list of all users but
    // only let a user modify their own data otherwise
    if (context.params.user && context.method !== 'find') {
      return context.params.user.id
    }

    return value
  }
})
```

What happened here?

- We are adding an optional `avatar` field to our user object. This is where we store a user image to show in the chat.
- The `userDataSchema` is updated to include the `avatar` so that a new user can be created with a custom avatar
- In the `userDataResolver`, if an `avatar` is not set, we set a default image using the [Gravatar avatar](https://en.gravatar.com/) for the email address
- The `userQueryResolver` for the user id property allows for a user to `find` all other users but only change (`patch`, `remove`) their own data

## Handling messages

Next we can look at the messages service schema. We want to include the date when the message was created as `createdAt` and the id of the user who sent it as `userId`. When we get a message back, we also want to populate the `user` with the user data from `userId` so that we can show their avatar and email.

Update the `src/services/messages/messages.schema.ts` file like this:

```ts{2,8,15-17,24-27,39-45,58-61,74-82}
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
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
export const messageValidator = getValidator(messageSchema, dataValidator)
export const messageResolver = resolve<Message, HookContext>({
  user: virtual(async (message, context) => {
    // Associate the user that sent the message
    return context.app.service('users').get(message.userId)
  })
})

export const messageExternalResolver = resolve<Message, HookContext>({})

// Schema for creating new entries
export const messageDataSchema = Type.Pick(messageSchema, ['text'], {
  $id: 'MessageData'
})
export type MessageData = Static<typeof messageDataSchema>
export const messageDataValidator = getValidator(messageDataSchema, dataValidator)
export const messageDataResolver = resolve<Message, HookContext>({
  userId: async (_value, _message, context) => {
    // Associate the record with the id of the authenticated user
    return context.params.user.id
  },
  createdAt: async () => {
    return Date.now()
  }
})

// Schema for updating existing entries
export const messagePatchSchema = Type.Partial(messageSchema, {
  $id: 'MessagePatch'
})
export type MessagePatch = Static<typeof messagePatchSchema>
export const messagePatchValidator = getValidator(messagePatchSchema, dataValidator)
export const messagePatchResolver = resolve<Message, HookContext>({})

// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(messageSchema,[
  'id',
  'text',
  'createdAt',
  'userId'
])
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
export const messageQueryResolver = resolve<MessageQuery, HookContext>({
  userId: async (value, user, context) => {
    // We want to be able to find all messages but
    // only let a user modify their own messages otherwise
    if (context.params.user && context.method !== 'find') {
      return context.params.user.id
    }

    return value
  }
})
```

::note
The `virtual()` in the `messageResolver` `user` property is a [virtual property](../../api/schema/resolvers#virtual-property-resolvers) and indicates that the value does not come from the messages database table.
::

## Creating a migration

Now that our schemas and resolvers have everything we need, we also have to update the database with those changes. For SQL databases this is done with migrations. Migrations are a best practice for SQL databases to roll out and undo changes to the data model. Every change we make in a schema will need its corresponding migration step.

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

## What's next?

In this chapter we learned about schemas and implemented all the things we need for our chat application. In the next chapter we will learn about [authentication](./authentication) and add a "Login with GitHub" button.
