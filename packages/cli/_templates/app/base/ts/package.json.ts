import { join } from 'path'
import { VariablesAppBase } from '..';
import { GeneratorContext, RenderResult } from '../../../../src';

export function render (context: GeneratorContext<VariablesAppBase>): RenderResult {
  const to = join('package.json')
  const pkg = {
    ...context.h.pkg,
    scripts: {
      ...context.h.pkg.scripts,
      dev: 'nodemon -x ts-node ${h.lib}/index.ts',
      compile: 'shx rm -rf lib/ && tsc',
      start: 'npm run compile && node lib/',
      test: 'mocha test/ --require ts-node/register --recursive --extension .ts --exit'
    }
  };
  const body = JSON.stringify(pkg)

  return { 
    body, 
    to,
    force: true
  }
}