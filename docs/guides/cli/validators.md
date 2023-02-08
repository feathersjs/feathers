---
outline: deep
---

# Validators

For all currently supported schema types, AJV is used as the default validator. See the [validators API documentation](../../api/schema/validators.md) for more information.

## AJV validators

The `src/validators.ts` file sets up two Ajv instances for data and querys (for which string types will be coerced automatically). It also sets up a collection of additional formats using [ajv-formats](https://ajv.js.org/packages/ajv-formats.html). The validators in this file can be customized according to the [Ajv documentation](https://ajv.js.org/) and [its plugins](https://ajv.js.org/packages/). You can find the available Ajv options in the [Ajs class API docs](https://ajv.js.org/options.html).

```ts
import { Ajv, addFormats } from '@feathersjs/schema'
import type { FormatsPluginOptions } from '@feathersjs/schema'

const formats: FormatsPluginOptions = [
  'date-time',
  'time',
  'date',
  'email',
  'hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex'
]

export const dataValidator = addFormats(new Ajv({}), formats)

export const queryValidator = addFormats(
  new Ajv({
    coerceTypes: true
  }),
  formats
)
```

## MongoDB ObjectIds

When choosing MongoDB, the validators file will also register the [`objectid` keyword](../../api/databases/mongodb.md#ajv-keyword) to convert strings to MongoDB Object ids.
