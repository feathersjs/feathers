# Service classes

The `service.class` file exports the [service class or object](../../api/services.md).

## Database services

When using a database, the service class will be extended from the [Feathers database adapter service](../../api/databases/common.md). Like any class, existing methods can be overriden or you can add your own methods (which can also be made available externally [as custom methods when registering the service](./service.md#registration)).

### Service customization

<LanguageBlock global-id="ts">

<BlockQuote type="tip">

The generic types for a database service are always `AdapterService<ResultType, DataType, ParamsType>`.

</BlockQuote>

</LanguageBlock>

<DatabaseBlock global-id="sql">

An [SQL Knex service](../../api/databases/knex.md) can be customized like this:

```ts
export interface MessageParams extends KnexAdapterParams<MessageQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class MessageService<ServiceParams extends Params = MessageParams> extends KnexService<
  Message,
  MessageData,
  ServiceParams
> {
  find(params: ServiceParams) {
    return super.find(params)
  }

  async myMethod(name: string) {
    return {
      message: `Hello ${name}`
    }
  }
}
```

</DatabaseBlock>

<DatabaseBlock global-id="mongodb">

An [MongoDB service](../../api/databases/mongodb.md) can be customized like this:

```ts
export interface MessageParams extends MongoDBAdapterParams<MessageQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessageService<ServiceParams extends Params = MessageParams> extends MongoDBService<
  Message,
  MessageData,
  ServiceParams
> {
  find(params: ServiceParams) {
    return super.find(params)
  }

  async myMethod(name: string) {
    return {
      message: `Hello ${name}`
    }
  }
}
```

</DatabaseBlock>

<LanguageBlock global-id="ts">

Note the `MessageService<ServiceParams extends Params = MessageParams>` generic. This is used to change the parameter type when using this service interface as a [client side service](./client.md).

</LanguageBlock>

## Custom services

As shown in the [Quick start](../basics/starting.md), Feathers can work with any database, third party API or custom functionality by implementing your own [services](../../api/services.md). When generating a custom service, a basic skeleton service will be created. You can remove the methods you don't need and add your own.

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

<BlockQuote type="info" label="note">

When removing methods, the `methods` list in the [service](./service.md) and [client](./client.md) files also needs to be updated accordingly.

</BlockQuote>

## getOptions

The `getOptions` function is a function that returns the options based on the [application](./app.md) that will be passed to the service class constructor.
