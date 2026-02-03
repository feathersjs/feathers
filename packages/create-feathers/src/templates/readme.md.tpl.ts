import { renderTemplate, toFile } from '@featherscloud/pinion'
import type { AppGeneratorContext } from '../commons.js'

const template = ({ name, description }: AppGeneratorContext) => /* md */ `# ${name}

> ${description}

## About

This project uses [Feathers](http://feathersjs.com). The universal web framework.

## Help

For more information on all the things you can do with Feathers visit [feathersjs.com](https://feathersjs.com).
`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('readme.md')))
