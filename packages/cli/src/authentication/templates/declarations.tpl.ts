import { generator, inject, before, toFile, when, append } from '@feathershq/pinion'
import { getSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const importTemplate = ({ upperName, schemaPath }: AuthenticationGeneratorContext) =>
  `import { ${upperName}Result } from './schemas/${schemaPath}'
`

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
        inject(getSource(importTemplate), before('export { NextFunction }'), toDeclarationFile)
      )
    )
    .then(when((ctx) => ctx.language === 'ts', inject(paramsTemplate, append(), toDeclarationFile)))
