import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const js = ({}: AppGeneratorContext) =>
`import { app } from './app.js'
import { logger } from './logger.js'

const port = app.get('port')
const host = app.get('host')

app.listen(port).then(() => {
  logger.info(\`Feathers app listening on http://\${host}:\${port}\`)
})
`

const ts = ({}: AppGeneratorContext) =>
`import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

app.listen(port).then(() => {
  logger.info(\`Feathers app listening on http://\${host}:\${port}\`)
})
`

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderSource({ js, ts }, toFile<AppGeneratorContext>(({ lib }) => lib, 'index')))
