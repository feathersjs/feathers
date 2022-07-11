# Schemas and resolvers

In Feathers, schemas and resolvers allow to define, validate and secure your data model and types.

<img style="margin: 2em;" src="/img/professor-bird-server.svg" alt="Professor bird at work">

Similar to how Feathers services are transport independent, schemas and resolvers are database independent. It comes in two main parts:

- [Schema](../../api/schema/schema.md) - Uses [JSON schema](https://json-schema.org/) to define a data model. This allows us to:
  - Ensure data is valid and always in the right format
  - Automatically get up to date TypeScript types from schema definitions
  - Create a typed client that can be used in React, Vue etc. apps
  - Automatically generate API documentation
  - Validate query string queries and convert them to the right type
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
- `dispatch` resolvers usually use the `result` schema to return a safe version of the data (e.g. hiding a users password) that can be sent to external clients


## Adding a user avatar

Let's extend our existing users schema to add an `avatar` property so that our users can have a profile image:

<LanguageBlock global-id="ts">

First we need to update the `src/services/users/users.schema.ts` file with the new `avatar` property. This can be done by adding the JSON schema property definition `avatar: { type: 'string' }` to the `usersDataSchema`:

</LanguageBlock>
<LanguageBlock global-id="js">

First we need to update the `src/services/users/users.schema.js` file with the new `avatar` property. This can be done by adding the JSON schema property definition `avatar: { type: 'string' }` to the `usersDataSchema`:

</LanguageBlock>

```ts{17-19}
import { schema, querySyntax } from '@feathersjs/schema'
import type { Infer } from '@feathersjs/schema'

// Schema for the basic data model (e.g. creating new entries)
export const usersDataSchema = schema({
  $id: 'UsersData',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    avatar: {
      type: 'string'
    }
  }
} as const)

export type UsersData = Infer<typeof usersDataSchema>

// Schema for making partial updates
export const usersPatchSchema = schema({
  $id: 'UsersPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...usersDataSchema.properties
  }
} as const)

export type UsersPatch = Infer<typeof usersPatchSchema>

// Schema for the data that is being returned
export const usersResultSchema = schema({
  $id: 'UsersResult',
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    ...usersDataSchema.properties,
    id: {
      type: 'string'
    }
  }
} as const)

export type UsersResult = Infer<typeof usersResultSchema>

// Queries shouldn't allow doing anything with the password
const { password, ...usersQueryProperties } = usersResultSchema.properties

// Schema for allowed query properties
export const usersQuerySchema = schema({
  $id: 'UsersQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(usersQueryProperties)
  }
} as const)

export type UsersQuery = Infer<typeof usersQuerySchema>
```

Next, instead of making users send a link to their avatar, we update the resolver to automatically add a link to the [Gravatar](http://en.gravatar.com/) image associated with the user's email address. To do this we add an `avatar` data resolver which means it gets added before the user gets saved to the database.

<LanguageBlock global-id="ts">

Update the `src/services/users/users.resolver.ts` file as follows:

</LanguageBlock>
<LanguageBlock global-id="js">

Update the `src/services/users/users.resolver.js` file as follows:

</LanguageBlock>

```ts{1,24-32,68-72}
import crypto from 'crypto'
import { resolve } from '@feathersjs/schema'
import { passwordHash } from '@feathersjs/authentication-local'
import type { HookContext } from '../declarations'
import type {
  UsersData,
  UsersPatch,
  UsersResult,
  UsersQuery
} from '../schemas/users.schema'
import {
  usersDataSchema,
  usersPatchSchema,
  usersResultSchema,
  usersQuerySchema
} from '../schemas/users.schema'

// Resolver for the basic data model (e.g. creating new entries)
export const usersDataResolver = resolve<UsersData, HookContext>({
  schema: usersDataSchema,
  validate: 'before',
  properties: {
    password: passwordHash({ strategy: 'local' }),
    avatar: async (_value, user) => {
      // Gravatar uses MD5 hashes from an email address to get the image
      const hash = crypto
        .createHash('md5')
        .update(user.email.toLowerCase())
        .digest('hex')
      // Return the full avatar URL
      return `https://s.gravatar.com/avatar/${hash}?s=60`
    }
  }
})

// Resolver for making partial updates
export const usersPatchResolver = resolve<UsersPatch, HookContext>({
  schema: usersPatchSchema,
  validate: 'before',
  properties: {}
})

// Resolver for the data that is being returned
export const usersResultResolver = resolve<UsersResult, HookContext>({
  schema: usersResultSchema,
  validate: false,
  properties: {}
})

// Resolver for the "safe" version that external clients are allowed to see
export const usersDispatchResolver = resolve<UsersResult, HookContext>({
  schema: usersResultSchema,
  validate: false,
  properties: {
    // The password should never be visible externally
    password: async () => undefined
  }
})

// Resolver for allowed query properties
export const usersQueryResolver = resolve<UsersQuery, HookContext>({
  schema: usersQuerySchema,
  validate: 'before',
  properties: {
    // If there is a user (e.g. with authentication)
    // They are only allowed to see their own data
    id: async (value, user, context) => {
      // We want to be able to get a list of all users
      // only let a user see and modify their own data otherwise
      if (context.params.user && context.method !== 'find') {
        return context.params.user.id
      }

      return value
    }
  }
})

// Export all resolvers in a format that can be used with the resolveAll hook
export const usersResolvers = {
  result: usersResultResolver,
  dispatch: usersDispatchResolver,
  data: {
    create: usersDataResolver,
    update: usersDataResolver,
    patch: usersPatchResolver
  },
  query: usersQueryResolver
}
```

## Handling messages

Next we can look at the messages service schema. We want to include the date when the message was sent and the id of the user who sent it.

<LanguageBlock global-id="ts">

Update the `src/services/messages/messages.schema.ts` file with the `userId` and `createdAt` properties:

</LanguageBlock>
<LanguageBlock global-id="js">

Update the `src/services/messages/messages.schema.js` file with the `userId` and `createdAt` properties:

</LanguageBlock>

```ts{3,15-20,53-55}
import { schema, querySyntax } from '@feathersjs/schema'
import type { Infer } from '@feathersjs/schema'
import { UsersResult } from './users.schema'

// Schema for the basic data model (e.g. creating new entries)
export const messagesDataSchema = schema({
  $id: 'MessagesData',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: {
      type: 'string'
    },
    createdAt: {
      type: 'number'
    },
    userId: {
      type: 'number' // 'string' if you are using MongoDB
    }
  }
} as const)

export type MessagesData = Infer<typeof messagesDataSchema>

// Schema for making partial updates
export const messagesPatchSchema = schema({
  $id: 'MessagesPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...messagesDataSchema.properties
  }
} as const)

export type MessagesPatch = Infer<typeof messagesPatchSchema>

// Schema for the data that is being returned
export const messagesResultSchema = schema({
  $id: 'MessagesResult',
  type: 'object',
  additionalProperties: false,
  required: [...messagesDataSchema.required, 'id', 'userId'],
  properties: {
    ...messagesDataSchema.properties,
    id: {
      type: 'string'
    }
  }
} as const)

export type MessagesResult = Infer<typeof messagesResultSchema> & {
  user: UsersResult
}

// Schema for allowed query properties
export const messagesQuerySchema = schema({
  $id: 'MessagesQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(messagesResultSchema.properties)
  }
} as const)

export type MessagesQuery = Infer<typeof messagesQuerySchema>
```

Both the `createdAt` and `userId` property can be added automatically before saving the data to the database. `createdAt` is the current date and `userId` is the authenticated user (we will see how to authenticate in the [next chapter](./authentication.md)). To do this we can update the `data` resolver. To populate the full user that sent the message in a response we can use the `result` resolver.

<LanguageBlock global-id="ts">

Update `src/services/messages/messages.resolver.ts` like this:

</LanguageBlock>
<LanguageBlock global-id="js">

Update `src/services/messages/messages.resolver.js` like this:

</LanguageBlock>

```ts{22-29,45-48}
import { resolve } from '@feathersjs/schema'
import type { HookContext } from '../declarations'

import type {
  MessagesData,
  MessagesPatch,
  MessagesResult,
  MessagesQuery
} from '../schemas/messages.schema'
import {
  messagesDataSchema,
  messagesPatchSchema,
  messagesResultSchema,
  messagesQuerySchema
} from '../schemas/messages.schema'

// Resolver for the basic data model (e.g. creating new entries)
export const messagesDataResolver = resolve<MessagesData, HookContext>({
  schema: messagesDataSchema,
  validate: 'before',
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

// Resolver for making partial updates
export const messagesPatchResolver = resolve<MessagesPatch, HookContext>({
  schema: messagesPatchSchema,
  validate: 'before',
  properties: {}
})

// Resolver for the data that is being returned
export const messagesResultResolver = resolve<MessagesResult, HookContext>({
  schema: messagesResultSchema,
  validate: false,
  properties: {
    user: async (_value, message, context) => {
      // Associate the user that sent the message
      return context.app.service('users').get(message.userId)
    }
  }
})

// Resolver for query properties
export const messagesQueryResolver = resolve<MessagesQuery, HookContext>({
  schema: messagesQuerySchema,
  validate: 'before',
  properties: {}
})

// Export all resolvers in a format that can be used with the resolveAll hook
export const messagesResolvers = {
  result: messagesResultResolver,
  data: {
    create: messagesDataResolver,
    update: messagesDataResolver,
    patch: messagesPatchResolver
  },
  query: messagesQueryResolver
}
```

## Creating a migration

Now that our schemas and resolvers are up to date, we also have to update the database with the changes that we made. For SQL databases this is done with migrations. Every change we make in a schema will need its corresponding migration step.

<BlockQuote type="warning">

If you chose MongoDB you do **not** need to create a migration.

</BlockQuote>

Initially, every database service will automatically add a migration that creates a table for it with an `id` and `text` property. Our users service also already added a migration to add the email and password fields for logging in. The migration for the changes we made in this chapter needs to

- Add the `avatar` string field to the `users` table
- Add the `createdAt` number field to the `messages` table
- Add the `userId` number field to the `messages` table and reference it with the `id` un the `users` table 

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

## Services, Hooks and Schemas

In the [previous chapter](./services.md) we extended our user service to add a user avatar. This could also be put in a hook instead but made a good example to illustrate how to extend an existing service. There are no explicit rules when to use a hook or when to extend a service but here are some guidelines.

Use a hook when

- The functionality can be used in more than one place (e.g. validation, permissions etc.)
- It is not a core responsibility of the service and the service can work without it (e.g. sending an email after a user has been created)

Extend a service when

- The functionality is only needed in this one place
- The service could not function without it

Create your own (custom) service when

- Multiple services are combined together (e.g. reports)
- The service does something other than talk to a database (e.g. another API, sensors etc.)


## What's next?

In this chapter we learned about schemas and implemented all the logic we need for our chat application. In the next chapter we will learn about [authentication](./authentication.md) as the last piece to get our chat application working.
