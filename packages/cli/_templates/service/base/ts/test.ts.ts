import { join } from 'path'
import { VariablesService } from '..'
import { GeneratorContext, RenderResult } from '../../../../src'

export function render (context: GeneratorContext<VariablesService>): RenderResult {
  const to = join(context.h.test, 'services', `${context.path}.test.ts`)
  const body = `
import assert from 'assert';
import { app } from \`../${context.relative}/${context.h.lib}/app\`;

describe('\'${context.name}\' service', () => {
  it('registered the service', () => {
    const service = app.service('${context.path}');

    assert.ok(service, 'Registered the service');
  });
});
}
`

  return { body, to }
}