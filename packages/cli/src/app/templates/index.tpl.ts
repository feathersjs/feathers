import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const template = ({}: AppGeneratorContext) => /* ts */ `import { app } from './app'
import { logger } from './logger'

const port = app.get('port')
const host = app.get('host')

app.listen(port).then(() => {
  logger.info(\`Feathers app listening on http://\${host}:\${port}\`)
})
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile<AppGeneratorContext>(({ lib }) => lib, 'index')
    )
  )
