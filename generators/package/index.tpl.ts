import { generator, renderTemplate, toFile } from '@featherscloud/pinion'
import { ModuleContext } from '../package'

interface Context extends ModuleContext {}

const template = ({ name }: Context) => `
export function ${name}() {
  return 'Hello from ${name}'
}
`

export const generate = (context: Context) =>
  generator(context).then(renderTemplate(template, toFile(context.packagePath, 'src', 'index.ts')))
