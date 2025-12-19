# @feathersjs/routing

Express and Koa compatible routers for Feathers applications. Uses `path-to-regexp` for full compatibility with Express and Koa routing patterns.

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
app.use('/docs/*path', docsService)
```

### Koa Router

```ts
import { feathers } from 'feathers'
import { KoaRouter } from '@feathersjs/routing'

const app = feathers()
app.routes = new KoaRouter()

// Now supports Koa routing patterns
app.use('/users/:id', userService)
app.use('/static/*path', staticService)
```

### Custom Options

Both routers accept options to customize behavior:

```ts
import { ExpressRouter } from '@feathersjs/routing'

// Override defaults
const router = new ExpressRouter({
  caseSensitive: true,  // default: false for Express, true for Koa
  trailing: true        // default: false for Express, true for Koa
})
```

## Features

- Express and Koa routing compatibility via `path-to-regexp`
- Named parameters (`:id`)
- Wildcards (`*path`)
- Optional parameters (`/users/:id?`)
- Regex constraints (`/users/:id(\\d+)`)
- Repeating parameters (`/files/:path+`)
- Case sensitivity control
- Runtime agnostic (Node.js, Deno, Bun, Cloudflare Workers)

## License

MIT
