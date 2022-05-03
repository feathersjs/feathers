import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({}: AppGeneratorContext) =>
`import { Application } from '../declarations'

export const services = (app: Application) => {
}
`

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile<AppGeneratorContext>(({ lib }) => lib, 'services', 'index.ts')))
