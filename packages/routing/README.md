# @feathersjs/routing

Express and Koa compatible routers for Feathers applications.

## Installation

```bash
npm install @feathersjs/routing
```

## Usage

### Express Router

```ts
import { feathers } from 'feathers'
import { ExpressRouter } from '@feathersjs/routing'

const app = feathers()
app.routes = new ExpressRouter()

// Now supports Express routing patterns
app.use('/users/:id', userService)
app.use('/docs/*', docsService)
```

### Koa Router

```ts
import { feathers } from 'feathers'
import { KoaRouter } from '@feathersjs/routing'

const app = feathers()
app.routes = new KoaRouter()

// Now supports Koa routing patterns
app.use('/users/:id', userService)
app.use('/static/*', staticService)
```

## Features

- Express and Koa routing compatibility
- Named parameters (`:id`)
- Wildcards (`*`)
- Case sensitivity control
- Runtime agnostic (Node.js, Deno, Bun, Cloudflare Workers)

## License

MIT
