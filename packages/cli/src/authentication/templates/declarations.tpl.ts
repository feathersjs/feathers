import { generator, inject, before, toFile, when, append } from '@feathershq/pinion'
import { AuthenticationGeneratorContext } from '../index'

const importTemplate = ({ upperName, folder, kebabName }: AuthenticationGeneratorContext) =>
  `import { ${upperName}Result } from './schemas/${folder.join('/')}/${kebabName}.schema`

const paramsTemplate = ({
  entity,
  upperName
}: AuthenticationGeneratorContext) => `// Add the ${entity} as an optional property to all params
declare module '@feathersjs/feathers' {
  interface Params {
    ${entity}?: ${upperName}Result
  }
}
`

const toDeclarationFile = toFile<AuthenticationGeneratorContext>(({ lib }) => lib, 'declarations.ts')

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx)
    .then(
      when(
        (ctx) => ctx.language === 'ts',
        inject(importTemplate, before('export { NextFunction }'), toDeclarationFile)
      )
    )
    .then(when((ctx) => ctx.language === 'ts', inject(paramsTemplate, append(), toDeclarationFile)))
