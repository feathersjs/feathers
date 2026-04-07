import { renderTemplate, toFile, when } from '@featherscloud/pinion'
import { AppGeneratorContext } from '../../commons'

const template =
  ({}: AppGeneratorContext) => /* ts */ `import { SseService as FeathersSseService } from 'feathers/http'
import { hooks } from 'feathers/hooks'

import { authenticate } from '../hooks/authenticate.js'

// Extends the Feathers service for server sent events (SSE) to add authentication and other hooks
@hooks([
  authenticate
])
export class SseService extends FeathersSseService {
}
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(
    when((ctx) => ctx.sse, renderTemplate(template, toFile('src', 'services', 'sse.ts')))
  )
