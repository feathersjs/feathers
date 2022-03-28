import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({}: AppGeneratorContext) =>
`
export default app => {
}
`

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile(({ lib }: AppGeneratorContext) => lib, 'services', 'index.js')))
