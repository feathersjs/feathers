import { join } from 'path'
import { VariablesAppBase } from '..';
import { GeneratorContext, RenderResult } from '../../../../src';
import { VariablesApp } from '../../new';

export function render (context: GeneratorContext<VariablesApp & VariablesAppBase>): RenderResult {
  const to = join('package.json');

  const pkg = {
    ...context.h.pkg,
    type: 'module',
    scripts: {
      ...context.h.pkg.scripts,
      start: `node ${context.h.lib}/`,
      dev: `nodemon ${context.h.lib}/`,
      test: 'mocha test/ --recursive --exit'
    }
  };

  const body = JSON.stringify(pkg)

  return { 
    body, 
    to,
    force: true
  }
}
