import { generator, toFile } from '@feathershq/pinion'
import { HookGeneratorContext } from '../index'
import { renderSource } from '../../commons'

const aroundTemplate = ({
  camelName,
  name
}: HookGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext, NextFunction } from '../declarations'

export const ${camelName} = async (context: HookContext, next: NextFunction) => {
  console.log(\`Running hook ${name} on \${context.path}\.\${context.method}\`)
  await next()
}
`

const regularTemplate = ({
  camelName,
  name
}: HookGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../declarations'

export const ${camelName} = async (context: HookContext) => {
  console.log(\`Running hook ${name} on \${context.path}\.\${context.method}\`)
}`

export const generate = (ctx: HookGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      (ctx) => (ctx.type === 'around' ? aroundTemplate(ctx) : regularTemplate(ctx)),
      toFile<HookGeneratorContext>(({ lib, kebabName }) => [lib, 'hooks', kebabName])
    )
  )
