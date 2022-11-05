---
outline: deep
---

# Service Class

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
    Model: app.get('mongodbClient').then((db) => db.collection('message')),
  }
}
```