import { renderTemplate, toFile } from '@featherscloud/pinion'
import type { AppGeneratorContext } from '../commons.js'

const template = ({}: AppGeneratorContext) => /* ts */ `import { feathers } from 'feathers'

export type Services = {}

export type Configuration = {}

const app = feathers<Services, Configuration>()

export { app }
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('src', 'app.ts')))
