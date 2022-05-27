import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const js = ({}: AppGeneratorContext) =>
  `
export const services = app => {
}
`

const ts = ({}: AppGeneratorContext) =>
  `import { Application } from '../declarations'

export const services = (app: Application) => {
}
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      { js, ts },
      toFile<AppGeneratorContext>(({ lib }) => lib, 'services', 'index')
    )
  )
