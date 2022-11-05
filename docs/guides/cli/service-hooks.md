---
outline: deep
---

# Generate a Service

## Hooks Overview

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
    events: [],
  })
  app.service('messages').hooks({
    around: {
      all: [authenticate('jwt')],
    },
    before: {
      all: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  })
}
```

## Service TypeScript Declarations

We already have an explanation of this in the troubleshooting guide, so we can link to there.

```ts
// Update Service Declarations https://dove.feathersjs.com/cli/service-overview.html#service-types
declare module '../../../../declarations' {
  interface ServiceTypes {
    'messages': TestingService
  }
}
```
