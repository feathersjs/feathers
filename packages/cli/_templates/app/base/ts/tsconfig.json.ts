import { join } from 'path'
import { GeneratorContext, RenderResult } from '../../../../src';
import { VariablesApp } from '../../new';

export function render (context: GeneratorContext<VariablesApp>): RenderResult {
  const to = join('tsconfig.json')
  const body = `
{
  "ts-node": {
    "files": true
  },
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./lib",
    "rootDir": "${context.h.lib}",
    "strict": true,
    "esModuleInterop": true
  },
  "exclude": [
    "test"
  ]
}
`

  return { 
    body, 
    to
  }
}