import { renderTemplate, runGenerators, toFile } from '@featherscloud/pinion'
import type { AppGeneratorContext } from '../commons.js'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Set __dirname in es module
const __dirname = dirname(fileURLToPath(import.meta.url))

const template = ({ sse }: AppGeneratorContext) => /* ts */ `import { feathers } from 'feathers'
import type { HookContext as FeathersHookContext, Application as FeathersApplication } from 'feathers'
import { MessageService } from './services/messages.js'
${sse ? `import { SseService } from './services/sse.js'` : ''}

export type Services = {
  messages: MessageService
  ${sse ? `sse: SseService` : ''}
}

export type Configuration = {
}

export type Application = FeathersApplication<Services, Configuration>

export type HookContext = FeathersHookContext<Application>

const app: Application = feathers<Services, Configuration>()

${sse ? `app.use('sse', new SseService())` : ''}
app.use('messages', new MessageService())

export { app }
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx)
    .then(renderTemplate(template, toFile('src', 'app.ts')))
    .then(runGenerators(__dirname, 'services'))
