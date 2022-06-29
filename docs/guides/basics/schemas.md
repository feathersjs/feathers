# Schemas and resolvers

Schemas and resolvers are a new concept introduced in Feathers v5 that helps to define, validate and secure your data model and types.

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

## Types

While schemas and resolvers can be used outside of a Feather application, you will usually encounter them in a Feathers context where they come in four kinds:

- `data` schemas and resolvers handle the data from the `create`, `update` and `patch` service methods and can be used to add things like default or calculated values on the server
- `query` schemas and resolvers validate and convert the querystring and can also be used for additional limits (like only allowing a user to see their own data)
- `result` schemas and resolvers define the data that is being returned. This is also where associated data would be defined
- `dispach` resolvers usually use the `result` schema to return a safe version of the data (e.g. hiding a users password) that can be sent to external clients

## Adding a user avatar

Let's extend our existing users schema to add an `avatar` property so that our users can have a profile image:

<LanguageBlock global-id="ts">

First we need to update the `src/schemas/users.schema.ts` file with the new `avatar` property. This can be done by adding the JSON schema property definition `avatar: { type: 'string' }` to the `usersDataSchema`:

<<< @/examples/ts/chat-users-schema.ts {17-19}

</LanguageBlock>
<LanguageBlock global-id="js">

</LanguageBlock>

Next, instead of making users send a link to their avatar, we update the resolver to automatically add a link to the [Gravatar](http://en.gravatar.com/) image associated with the user's email address. To do this we add an `avatar` data resolver which means it gets added before the user gets saved to the database.

<LanguageBlock global-id="ts">

Update the `src/schemas/users.resolver.ts` file as follows:

<<< @/examples/ts/chat-users-resolver.ts {1,19-24}

</LanguageBlock>
<LanguageBlock global-id="js">

</LanguageBlock>

## Handling messages

Next we can look at the messages service schema. We want to include the date when the message was sent and the id of the user who sent it:

<LanguageBlock global-id="ts">

Update the `src/schemas/messages.schema.ts` file with the `userId` and `createdAt` properties:

<<< @/examples/ts/chat-messages-schema.ts {3,15-20,53-55}

</LanguageBlock>
<LanguageBlock global-id="js">

</LanguageBlock>

Both the `createdAt` and `userId` property can be added automatically before saving the data to the database. `createdAt` is the current date and `userId` is the authenticated user (we will see how to authenticate in the [next chapter](./authentication.md)). To do this we can update the `data` resolver. To populate the full user that sent the message in a response we can use the `result` resolver.

<LanguageBlock global-id="ts">

Update `src/resolvers/messages.resolver.ts` like this:

<<< @/examples/ts/chat-messages-resolver.ts {17-23,39-42}

</LanguageBlock>
<LanguageBlock global-id="js">

</LanguageBlock>

## Creating a migration

Now that our schemas and resolvers are up to date, we also have to update the database with the changes that we made. For SQL databases this is done with migrations. Every change we make in a schema will need its corresponding migration step.

<BlockQuote type="warning">

If you chose MongoDB you do **not** need to create a migration.

</BlockQuote>

Initially, every database service will automatically add a migration that creates a table for it with an `id` and `text` property. Our users service also already added a migration to add the email and password fields for logging in. The migration for the changes we made in this chapter needs to

- Add the `avatar` string field to the `users` table
- To the `messasges` table
  - Add the `createdAt` number
  - Add the `userId` number field referencing the `id` column in the `users` table

To create a new migration with the name `chat` run

```
npm run migrate:make -- chat
```

You should see something like

```
Created Migration: /path/to/feathers-chat/migrations/20220622012334_chat.(ts|js)
```

Open that file and update it as follows

<LanguageBlock global-id="ts">

<<< @/examples/ts/chat-migration.ts {4-11,15-22}

</LanguageBlock>
<LanguageBlock global-id="js">

</LanguageBlock>

We can run the migrations on the current database with

```
npm run migrate
```

## What's next?

In this chapter we learned about schemas and implemented all the logic we need for our chat application. In the next chapter we will learn about [authentication](./authentication.md) as the last piece to get our chat application working.
