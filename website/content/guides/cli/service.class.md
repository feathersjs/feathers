

# Service classes

The `<service>.class` file exports the [service class or object](../../api/services).

## Database services

When using a database, the service class will be extended from the [Feathers database adapter service](../../api/databases/common). Like any class, existing methods can be overriden or you can add your own methods (which can also be made available externally [as custom methods when registering the service](./service#registration)).

::tip[Note]
The generic types for a database service are always `AdapterService<MessageType, DataType, ParamsType, PatchType>`. The `MessageService<ServiceParams extends Params = MessageParams>` generic is used to change the parameter type when using this service interface as a [client side service](./client).
::

### Overriding methods

When overriding an existing [service method](../../api/services#service-methods) on a database adapter the method and overload signatures have to match. The following example shows how to override every service method. Only the methods you want to customize have to be added.

The [SQL Knex service](../../api/databases/knex) methods can be customized like this:

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

### Other service methods

It is also possible to write your own service methods where the signatures don't have to match by extending from the `KnexAdapter` (instead of the `KnexService`) class. It does not have any of the service methods implemented but you can use the internal `_find`, `_get`, `_update`, `_patch` and `_remove` [adapter methods](../../api/databases/common#methods-without-hooks) to work with the database and implement the service method in the way you need.

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

### Custom methods

[Custom service methods](../../api/services#custom-methods) can be added to an [SQL Knex service](../../api/databases/knex) as follows:

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

## Custom services

As shown in the [Quick start](../basics/starting), Feathers can work with any database, third party API or custom functionality by implementing your own [services](../../api/services). When generating a custom service, a basic skeleton service will be created. You can remove the methods you don't need and add others you need.

While service methods still have to follow the [standard](../../api/services#service-methods) or [custom](../../api/services#custom-methods) method signatures, the parameter and return types can be whatever works best for the service you are implementing. If a service method is only for internal use (and not for clients to call) there are no method signature or return value restrictions.

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

## getOptions

The `getOptions` function is a function that returns the options based on the [application](./app) that will be passed to the service class constructor. This is where you can pass [common adapter options](../../api/databases/common#options) as well as [MongoDB](../../api/databases/mongodb#serviceoptions) or [SQL](../../api/databases/knex#serviceoptions) specific or custom service options.
