import { generator, inject, before, toFile, when, append } from '@feathershq/pinion'
import { AuthenticationGeneratorContext } from '../index'

const importTemplate = ({
  upperName,
  folder,
  fileName
}: AuthenticationGeneratorContext) => /* ts */ `import { ${upperName} } from './services/${folder.join(
  '/'
)}/${fileName}'
`

const paramsTemplate = ({
  entity,
  upperName
}: AuthenticationGeneratorContext) => /* ts */ `// Add the ${entity} as an optional property to all params
declare module '@feathersjs/feathers' {
  interface Params {
    ${entity}?: ${upperName}
  }
}
`

const toDeclarationFile = toFile<AuthenticationGeneratorContext>(({ lib }) => lib, 'declarations.ts')

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx)
    .then(
      when(
        (ctx) => ctx.language === 'ts',
        inject(
          importTemplate,
          before(/export \{ NextFunction \}|export type \{ NextFunction \}/),
          toDeclarationFile
        )
      )
    )
    .then(when((ctx) => ctx.language === 'ts', inject(paramsTemplate, append(), toDeclarationFile)))
