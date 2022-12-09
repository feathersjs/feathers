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
