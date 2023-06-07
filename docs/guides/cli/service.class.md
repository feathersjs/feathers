---
outline: deep
---

# Service classes

The `<service>.class` file exports the [service class or object](../../api/services.md).

## Database services

When using a database, the service class will be extended from the [Feathers database adapter service](../../api/databases/common.md). Like any class, existing methods can be overriden or you can add your own methods (which can also be made available externally [as custom methods when registering the service](./service.md#registration)).

<LanguageBlock global-id="ts">

<BlockQuote type="tip" label="Note">

The generic types for a database service are always `AdapterService<MessageType, DataType, ParamsType, PatchType>`. The `MessageService<ServiceParams extends Params = MessageParams>` generic is used to change the parameter type when using this service interface as a [client side service](./client.md).

</BlockQuote>

</LanguageBlock>

### Overriding methods

When overriding an existing [service method](../../api/services.md#service-methods) on a database adapter the method and overload signatures have to match. The following example shows how to override every service method. Only the methods you want to customize have to be added.

<DatabaseBlock global-id="sql">

The [SQL Knex service](../../api/databases/knex.md) methods can be customized like this:

```ts
import { Id, NullableId, Paginated } from '@feathersjs/feathers'

export interface MessageParams extends KnexAdapterParams<MessageQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class MessageService<ServiceParams extends Params = MessageParams> extends KnexService<
  Message,
  MessageData,
  MessageParams,
  MessagePatch
> {
  async find(
    params?: MessageParams & { paginate?: { default?: number; max?: number } }
  ): Promise<Paginated<Message>>
  async find(params?: ServiceParams & { paginate: false }): Promise<Message[]>
  async find(params?: ServiceParams): Promise<Paginated<Message> | Message[]>
  async find(params?: ServiceParams): Promise<Paginated<Message> | Message[]> {
    return super.find(params)
  }

  async get(id: Id, params?: ServiceParams): Promise<Message> {
    return super.get(id, params)
  }

  async create(data: MessageData, params?: ServiceParams): Promise<Message>
  async create(data: MessageData[], params?: ServiceParams): Promise<Message[]>
  async create(data: MessageData | MessageData[], params?: ServiceParams): Promise<Message | Message[]> {
    return super.create(data, params)
  }

  async update(id: Id, data: Data, params?: ServiceParams): Promise<Message> {
    return super.update(id, data, params)
  }

  async patch(id: Id, data: MessagePatch, params?: ServiceParams): Promise<Message>
  async patch(id: null, data: MessagePatch, params?: ServiceParams): Promise<Message[]>
  async patch(id: NullableId, data: MessagePatch, params?: ServiceParams): Promise<Message | Message[]> {
    return super.patch(id, data, params)
  }

  async remove(id: Id, params?: ServiceParams): Promise<Message>
  async remove(id: null, params?: ServiceParams): Promise<Message[]>
  async remove(id: NullableId, params?: ServiceParams): Promise<Message | Message[]> {
    return super.remove(id, params)
  }
}
```

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

The [MongoDB service](../../api/databases/mongodb.md) methods can be customized like this:

```ts
import { Paginated } from '@feathersjs/feathers'
import { AdapterId } from '@feathersjs/mongodb'

export interface MessageParams extends MongoDBAdapterParams<MessageQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessageService<ServiceParams extends Params = MessageParams> extends MongoDBService<
  Message,
  MessageData,
  MessageParams,
  MessagePatch
> {
  async find(
    params?: ServiceParams & { paginate?: { paginate?: { default?: number; max?: number } } }
  ): Promise<Paginated<Message>>
  async find(params?: ServiceParams & { paginate: false }): Promise<Message[]>
  async find(params?: ServiceParams): Promise<Paginated<Message> | Message[]>
  async find(params?: ServiceParams): Promise<Paginated<Message> | Message[]> {
    return super.find(params)
  }

  async get(id: AdapterId, params?: ServiceParams): Promise<Message> {
    return super.get(id, params)
  }

  async create(data: MessageData, params?: ServiceParams): Promise<Message>
  async create(data: MessageData[], params?: ServiceParams): Promise<Message[]>
  async create(data: MessageData | MessageData[], params?: ServiceParams): Promise<Message | Message[]> {
    return super.create(data, params)
  }

  async update(id: AdapterId, data: MessageData, params?: ServiceParams): Promise<Message> {
    return super.update(id, data, params)
  }

  async patch(id: null, data: MessagePatch, params?: ServiceParams): Promise<Message[]>
  async patch(id: AdapterId, data: MessagePatch, params?: ServiceParams): Promise<Message>
  async patch(
    id: NullableAdapterId,
    data: MessagePatch,
    params?: ServiceParams
  ): Promise<Message | Message[]> {
    return super.patch(id, data, params)
  }

  async remove(id: AdapterId, params?: ServiceParams): Promise<Message>
  async remove(id: null, params?: ServiceParams): Promise<Message[]>
  async remove(id: NullableAdapterId, params?: ServiceParams): Promise<Message | Message[]> {
    return super.remove(id, params)
  }
}
```

</DatabaseBlock>

### Other service methods

<DatabaseBlock global-id="sql">

It is also possible to write your own service methods where the signatures don't have to match by extending from the `KnexAdapter` (instead of the `KnexService`) class. It does not have any of the service methods implemented but you can use the internal `_find`, `_get`, `_update`, `_patch` and `_remove` [adapter methods](../../api/databases/common.md#methods-without-hooks) to work with the database and implement the service method in the way you need.

```ts
import { Id } from '@feathersjs/feathers'
import { KnexAdapter } from '@feathersjs/knex'

export interface MessageParams extends KnexAdapterParams<MessageQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class MessageService<ServiceParams extends Params = MessageParams> extends KnexAdapter<
  Message,
  MessageData,
  MessageParams,
  MessagePatch
> {
  async find(params: ServiceParams) {
    const page = this._find(params)

    return {
      status: 'ok',
      ...page
    }
  }

  async get(id: Id, params: ServiceParams) {
    return {
      message: `Hello ${id}`
    }
  }
}
```

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

It is also possible to write your own service methods where the signatures don't have to match by extending from the `MongoDbAdapter` (instead of the `MongoDBService`) class. It does not have any of the service methods implemented but you can use the internal `_find`, `_get`, `_update`, `_patch` and `_remove` [adapter methods](../../api/databases/common.md#methods-without-hooks) to work with the database and implement the service method the way you need.

```ts
import { Id } from '@feathersjs/feathers'
import { MongoDbAdapter } from '@feathersjs/mongodb'

export interface MessageParams extends MongoDBAdapterParams<MessageQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessageService<ServiceParams extends Params = MessageParams> extends MongoDbAdapter<
  Message,
  MessageData,
  MessageParams,
  MessagePatch
> {
  async find(params: ServiceParams) {
    const page = this._find(params)

    return {
      status: 'ok',
      ...page
    }
  }

  async get(id: Id, params: ServiceParams) {
    return {
      message: `Hello ${id}`
    }
  }
}
```

</DatabaseBlock>

### Custom methods

<DatabaseBlock global-id="sql">

[Custom service methods](../../api/services.md#custom-methods) can be added to an [SQL Knex service](../../api/databases/knex.md) as follows:

```ts
export interface MessageParams extends KnexAdapterParams<MessageQuery> {}

export type MyMethodData = { greeting: string }

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class MessageService<ServiceParams extends Params = MessageParams> extends KnexService<
  Message,
  MessageData,
  MessageParams,
  MessagePatch
> {
  async myMethod(data: MyMethodData, params: ServiceParams) {
    return {
      message: `${data.greeting || 'Hello'} ${params.user.name}!`
    }
  }
}
```

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

[Custom service methods](../../api/services.md#custom-methods) can be added to a [MongoDB service](../../api/databases/mongodb.md) like this:

```ts
export interface MessageParams extends MongoDBAdapterParams<MessageQuery> {}

export type MyMethodData = { name: string }

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessageService<ServiceParams extends Params = MessageParams> extends MongoDBService<
  Message,
  MessageData,
  MessageParams,
  MessagePatch
> {
  async myMethod(data: MyMethodData, params: ServiceParams) {
    return {
      message: `${data.greeting || 'Hello'} ${params.user.name}!`
    }
  }
}
```

</DatabaseBlock>

## Custom services

As shown in the [Quick start](../basics/starting.md), Feathers can work with any database, third party API or custom functionality by implementing your own [services](../../api/services.md). When generating a custom service, a basic skeleton service will be created. You can remove the methods you don't need and add others you need.

<LanguageBlock global-id="ts">

While service methods still have to follow the [standard](../../api/services.md#service-methods) or [custom](../../api/services.md#custom-methods) method signatures, the parameter and return types can be whatever works best for the service you are implementing. If a service method is only for internal use (and not for clients to call) there are no method signature or return value restrictions.

```ts
import type { Id, NullableId, Params } from '@feathersjs/feathers'

interface MyParams extends Params {}

class MyService {
  async find(params: MyParams) {
    return {
      message: 'This type is inferred'
    }
  }

  async get(id: Id) {
    return [
      {
        id
      }
    ]
  }

  async create(data: Message, params: MyParams) {
    return data
  }

  // Custom method made available to clients needs to have `data` and `params`
  async customMethod(data: CustomMethodData, params: MyParams) {}

  // A method that is only available internally can do anything
  async anyOtherMethod() {
    const [entry] = await this.get('david')

    return entry.id
  }
}
```

</LanguageBlock>

## getOptions

The `getOptions` function is a function that returns the options based on the [application](./app.md) that will be passed to the service class constructor. This is where you can pass [common adapter options](../../api/databases/common.md#options) as well as [MongoDB](../../api/databases/mongodb.md#serviceoptions) or [SQL](../../api/databases/knex.md#serviceoptions) specific or custom service options.
