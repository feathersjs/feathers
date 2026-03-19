import { renderTemplate, toFile } from '@featherscloud/pinion'
import type { AppGeneratorContext } from '../commons.js'

const template = `{
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 110,
  "semi": false,
  "trailingComma": "none",
  "singleQuote": true
}`

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(template, toFile('.prettierrc')))
