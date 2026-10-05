import { deepStrictEqual, rejects, strictEqual } from 'assert'
import { getContext } from '@featherscloud/pinion'
import { install } from '../lib/commons'

describe('install dependencies', () => {
  for (const packager of ['npm', 'yarn', 'pnpm']) {
    for (const dev of [false, true]) {
      it(`installs ${dev ? 'development' : 'production'} dependencies with ${packager}`, async () => {
        const dependencies = ['knex', 'pg', 'sqlite3-other', '@feathersjs/client']
        const calls: { command: string; args: string[] }[] = []
        const ctx = getContext(
          { language: 'ts' as const },
          {
            exec: async (command, args) => {
              calls.push({ command, args })
              return 0
            }
          }
        )
        const result = await install(
          () => dependencies,
          dev,
          () => packager
        )(ctx)

        strictEqual(result, ctx)
        deepStrictEqual(calls, [
          {
            command: packager,
            args: [
              packager === 'yarn' ? 'add' : 'install',
              ...dependencies,
              ...(dev ? [packager === 'yarn' ? '--dev' : '--save-dev'] : [])
            ]
          }
        ])
      })
    }

    for (const [dependency, buildDependency] of [
      ['sqlite3', 'sqlite3'],
      ['sqlite3@^6.0.1', 'sqlite3'],
      ['@feathersjs/cli', 'esbuild'],
      ['@feathersjs/cli@5.0.50', 'esbuild']
    ]) {
      it(`allows required build scripts when installing ${dependency} with ${packager}`, async () => {
        const dependencies = ['knex', dependency]
        const dev = buildDependency === 'esbuild'
        const calls: { command: string; args: string[] }[] = []
        const ctx = getContext(
          { language: 'ts' as const },
          {
            exec: async (command, args) => {
              calls.push({ command, args })
              return 0
            }
          }
        )

        await install(dependencies, dev, packager)(ctx)

        deepStrictEqual(calls, [
          {
            command: packager,
            args: [
              packager === 'yarn' ? 'add' : 'install',
              ...dependencies,
              ...(dev ? [packager === 'yarn' ? '--dev' : '--save-dev'] : []),
              ...(packager === 'pnpm' ? [`--allow-build=${buildDependency}`] : [])
            ]
          }
        ])
      })
    }
  }

  it('does not swallow installation failures', async () => {
    const error = new Error('Installation failed')
    const ctx = getContext(
      { language: 'ts' as const },
      {
        exec: async () => {
          throw error
        }
      }
    )

    await rejects(install(['sqlite3'], false, 'pnpm')(ctx), (actual) => actual === error)
  })
})
