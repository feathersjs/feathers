---
outline: deep
---

# Logging

## Logger

The `src/logger.ts` file initialises the widely used [Winston logger](https://github.com/winstonjs/winston) library, by default with the `info` log level, logging to the console.

```ts
import { createLogger, format, transports } from 'winston'

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
export const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: 'info',
  format: format.combine(format.splat(), format.simple()),
  transports: [new transports.Console()]
})
```

You can import the logger directly in any file where you want to add logging information.

```ts
import { logger } from './logger'

logger.info('Log some information here')
```

## Error Logging Hook

The `src/hooks/log-error.ts` file exports a `logError` hook that uses the above logger to log any error for a service method, including validation error details (when they are available). It is registered as an [application hook](./application.md#application-hooks) `all` hook, meaning it will log errors for any service method.

## Profiling example

To log some basic profiling information like which method was called and how long it took to run you can create a new _around_ hook called `profiler` via

```
npx feathers generate hook
```

Then update `src/hooks/profiler.ts` as follows:

```ts
import type { HookContext, NextFunction } from '../declarations'
import { logger } from '../logger'

export const profiler = async (context: HookContext, next: NextFunction) => {
  const startTime = Date.now()

  await next()

  const runtime = Date.now() - startTime

  console.log(`Calling ${context.method} on service ${context.path} took ${runtime}ms`)
}
```

And add it in `src/app.ts` as an application hook after the `logError` hook as follows:

```ts{1,8}
import { profiler } from './hooks/profiler'

//...

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [ logError, profiler ]
  },
  before: {},
  after: {},
  error: {}
})
```
