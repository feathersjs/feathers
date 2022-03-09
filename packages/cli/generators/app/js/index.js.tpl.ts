import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({}: AppGeneratorContext) =>
`import { app } from './app.js';
import { logger } from './logger.js';

const port = app.get('port');
const host = app.get('host');

app.listen(port).then(() => {
  logger.info(\`Feathers app listening on http://\${host}:\${port}\`);
});
`

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile(({ lib }: AppGeneratorContext) => lib, 'index.js')))
