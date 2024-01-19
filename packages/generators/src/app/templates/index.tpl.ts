import { toFile } from '@featherscloud/pinion'
import { renderSource } from '../../commons.js'
import { AppGeneratorContext } from '../index.js'

const template = ({}: AppGeneratorContext) => /* ts */ `import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) =>
  logger.error('Unhandled Rejection %O', reason)
)

app.listen(port).then(() => {
  logger.info(\`Feathers app listening on http://\${host}:\${port}\`)
})
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(
    renderSource(
      template,
      toFile<AppGeneratorContext>(({ lib }) => lib, 'index')
    )
  )
