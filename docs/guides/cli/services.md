---
outline: deep
---

# Service

## Service class

### Database services

### Custom services

## Service file

### Registration

### Custom methods

### Hooks

## TypeScript

### Generics

### Registration

Link here from the class file in the generated app:

Todo: Implement ServiceAdapter picker for the following

## Knex

## MongoDB

```ts
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Message, MessageData, MessageQuery } from './messages.schema'

export interface MessageParams extends MongoDBAdapterParams<MessageQuery> {}

// Message class for MongoDB https://dove.feathersjs.com/cli/service-class
export class MessageService extends MongoDBService<Message, MessageData, MessageParams> {}

export const getOptions = (app: Application) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('message'))
  }
}
```

## Registering hooks

Where to link for the comment above the service hooks?:

```ts
import { authenticate } from '@feathersjs/authentication'

import type { Application } from '../../../../declarations'
import { TestingService, getOptions } from './test.class'

export * from './test.class'

// Messages service and hooks https://dove.feathersjs.com/cli/service-overview.html
export const testing = (app: Application) => {
  app.use('messages', new TestingService(getOptions(app)), {
    methods: ['find', 'get', 'create', 'update', 'patch', 'remove'],
    events: []
  })
  app.service('messages').hooks({
    around: {
      all: [authenticate('jwt')]
    },
    before: {
      all: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
```

## Service TypeScript Declarations

We already have an explanation of this in the troubleshooting guide, so we can link to there.

```ts
// Update Service Declarations https://dove.feathersjs.com/cli/service-overview.html#service-types
declare module '../../../../declarations' {
  interface ServiceTypes {
    messages: TestingService
  }
}
```
