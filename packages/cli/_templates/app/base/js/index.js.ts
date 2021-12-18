import { join } from 'path'
import { VariablesAppBase } from '..';
import { GeneratorContext, RenderResult } from '../../../../src';
import { VariablesApp } from '../../new';

export function render (context: GeneratorContext<VariablesApp & VariablesAppBase>): RenderResult {
  const to = join(context.h.lib, 'index.ts');
  const body = `
import { app } from './app.js';
import { logger } from './logger.js';

const port = app.get('port');
const host = app.get('host');

app.listen(port).then(() => {
  logger.info(\`Feathers app listening on http://\${host}:\${port}\`);
});
`

  return { 
    body, 
    to
  }
}