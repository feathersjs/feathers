---
outline: deep
---

# Memory Adapter

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/memory.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/memory)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/memory/CHANGELOG.md)

</Badges>

`@feathersjs/memory` is a service adatper for in-memory data storage that works on all platforms. It is normally not used to store data on a production server but can be useful for data that isn't persistent and to e.g. cache data in browser or React Native applications.

```bash
$ npm install --save @feathersjs/memory
```

<BlockQuote>

The memory adapter implements the [common database adapter API](./common) and [querying syntax](./querying).

</BlockQuote>

## API

### Usage

```ts
import { MemoryService } from '@feathersjs/memory'

type Message = {
  id: number
  text: string
}

type MessageData = Pick<Message, 'text'>

class MyMessageService extends MemoryService<Message, MessageData> {}

app.use('messages', new MyMessageService({}))
```

### Options

The following options are available:

- `id` (_optional_, default: `'id'`) - The name of the id field property.
- `startId` (_optional_, default: `0`) - An id number to start with that will be incremented for every new record (unless it is already set).
- `store` (_optional_) - An object with id to item assignments to pre-initialize the data store
- `events` (_optional_) - A list of [custom service events](https://docs.feathersjs.com/api/events.html#custom-events) sent by this service
- `paginate` (_optional_) - A [pagination object](https://docs.feathersjs.com/api/databases/common.html#pagination) containing a `default` and `max` page size
- `allow` (_optional_) - A list of additional query parameters to allow
- `multi` (_optional_) - Allow `create` with arrays and `update` and `remove` with `id` `null` to change multiple items. Can be `true` for all methods or an array of allowed methods (e.g. `[ 'remove', 'create' ]`)
