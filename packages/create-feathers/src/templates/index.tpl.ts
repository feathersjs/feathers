import { renderTemplate, toFile } from '@featherscloud/pinion'
import type { AppGeneratorContext } from '../commons.js'

const nodeTemplate = ({}: AppGeneratorContext) => /* ts */ `import { createServer } from 'node:http'
import { createHandler } from 'feathers/http'
import { toNodeHandler } from 'feathers/http/node'
import { app } from './app.js'

const PORT = process.env.PORT || 3030
const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

server.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`)
})

// Call app.setup to initialize all services
await app.setup(server)
`

const denoTemplate = ({}: AppGeneratorContext) => /* ts */ `import { createHandler } from 'feathers/http'
import { app } from './app.js'

const port = Deno.env.get('PORT') || 3030

const handler = createHandler(app)

Deno.serve({ port }, handler)
`

const bunTemplate = ({}: AppGeneratorContext) => /* ts */ `import { createHandler } from 'feathers/http'
import { app } from './app.js'

const port = Bun.env.PORT || 3030
const handler = createHandler(app)

Bun.serve({
  port,
  fetch: handler
})
`

const template = (ctx: AppGeneratorContext) => {
  switch (ctx.platform) {
    case 'deno':
      return denoTemplate(ctx)
    case 'bun':
      return bunTemplate(ctx)
    case 'node':
      return nodeTemplate(ctx)
    default:
      throw new Error('Unsupported platform')
  }
}

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('src', 'index.ts')))
