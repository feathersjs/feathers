import type { Callable, PinionContext } from '@featherscloud/pinion'
import { generator, install, prompt, runGenerators, toFile } from '@featherscloud/pinion'

export interface ModuleContext extends PinionContext {
  name: string
  uppername: string
  description: string
  moduleName: string
  packagePath: Callable<string, ModuleContext>
}

export const generate = (context: ModuleContext) =>
  generator(context)
    .then(
      prompt<ModuleContext>([
        {
          type: 'input',
          name: 'name',
          message: 'What is the name of the module?'
        },
        {
          type: 'input',
          name: 'description',
          message: 'Write a short description'
        }
      ])
    )
    .then((ctx) => {
      return {
        ...ctx,
        moduleName: `@feathersjs/${ctx.name}`,
        uppername: ctx.name.charAt(0).toUpperCase() + ctx.name.slice(1),
        packagePath: toFile('packages', ctx.name)
      }
    })
    .then(runGenerators(__dirname, 'package'))
    .then(
      install<ModuleContext>(
        ['@types/node', 'shx', 'ts-node', 'typescript', 'mocha'],
        true,
        (context) => `npm --workspace packages/${context.name}`
      )
    )
