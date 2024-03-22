import { generator, renderTemplate, toFile } from '@featherscloud/pinion'
import { ModuleContext } from '../package'

const template = ({ description, moduleName }: ModuleContext) => `# ${moduleName}

[![CI](https://github.com/feathersjs/feathers/workflows/CI/badge.svg)](https://github.com/feathersjs/feathers/actions?query=workflow%3ACI)
[![Download Status](https://img.shields.io/npm/dm/${moduleName}.svg?style=flat-square)](https://www.npmjs.com/package/${moduleName})
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/qa8kez8QBx)

> ${description}

## Installation

\`\`\`
npm install ${moduleName} --save
\`\`\`

## Documentation

Refer to the [Feathers API documentation](https://feathersjs.com/api) for more details.

## License

Copyright (c) ${new Date().getFullYear()} [Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)

Licensed under the [MIT license](LICENSE).
`

export const generate = (context: ModuleContext) =>
  generator(context).then(renderTemplate(template, toFile(context.packagePath, 'README.md')))
