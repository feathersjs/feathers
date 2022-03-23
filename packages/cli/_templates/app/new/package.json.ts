import { join } from 'path'
import { VariablesApp } from '.'
import { GeneratorContext, PackageJson, RenderResult } from '../../../src'

export function render (context: GeneratorContext<VariablesApp>): RenderResult {
  const to = join('package.json')
  const pkg: PackageJson = {
    name: context.name,
    description: context.description,
    version: '0.0.0',
    homepage: '',
    private: true,
    keywords: [ 'feathers' ],
    author: {
      name: ""
    },
    contributors: [],
    bugs: {},
    engines: {
      node: '>= ' + process.version.substring(1)
    },
    feathers: {
      language: context.language,
      packager: context.packager,
      database: context.database,
      framework: context.framework,
      transports: context.transports
    },
    directories: {
      lib: context.lib,
      test: 'test'
    },
    main: `${context.lib}/`
  }

  const body = JSON.stringify(pkg);

  return { 
    body, 
    to
  }
}