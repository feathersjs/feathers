/* eslint-disable @typescript-eslint/prefer-for-of */
import os from 'os'
import path from 'path'
import { mkdtemp } from 'fs/promises'
import assert from 'assert'
import { getContext } from '@feathershq/pinion'

import { AppGeneratorContext } from '../src/app'
import { generate } from '../lib'
import { FeathersBaseContext } from '../src/commons'
import { ConnectionGeneratorArguments } from '../src/connection'
import { ServiceGeneratorArguments } from '../src/service'
import { combinate, dependencyVersions } from './utils'

const matrix = {
  language: ['js', 'ts'] as const,
  framework: ['koa', 'express'] as const
}

const defaultCombination = {
  language: process.env.FEATHERS_LANGUAGE || 'ts',
  framework: process.env.FEATHERS_FRAMEWORK || 'koa'
}

const combinations =
  process.version > 'v16.0.0' ? (process.env.CI ? combinate(matrix as any) : [defaultCombination]) : []

describe('@feathersjs/cli', () => {
  for (const { language, framework } of combinations) {
    describe(`${language} ${framework} app`, () => {
      const name = `feathers_${language}_${framework}`

      let context: FeathersBaseContext
      let cwd: string

      before(async () => {
        cwd = await mkdtemp(path.join(os.tmpdir(), name + '-'))
        context = await generate(
          getContext<AppGeneratorContext>(
            {
              name,
              framework,
              language,
              dependencyVersions,
              lib: 'src',
              description: 'A Feathers test app',
              packager: 'npm',
              database: 'sqlite',
              connectionString: `${name}.sqlite`,
              transports: ['rest', 'websockets'],
              authStrategies: ['local', 'github'],
              _: ['generate', 'app']
            },
            { cwd }
          )
        )
      })

      it('generated app with SQLite and passes tests', async () => {
        const testResult = await context.pinion.exec('npm', ['test'], { cwd })

        assert.ok(context)
        assert.strictEqual(testResult, 0)
      })

      it('generates a MongoDB connection and service and passes tests', async () => {
        const connectionContext = await generate(
          getContext<ConnectionGeneratorArguments>(
            {
              dependencyVersions,
              database: 'mongodb' as const,
              connectionString: `mongodb://localhost:27017/${name}`,
              _: ['generate', 'connection']
            },
            { cwd }
          )
        )
        const mongoServiceContext = await generate(
          getContext<ServiceGeneratorArguments>(
            {
              dependencyVersions,
              name: 'testing',
              path: 'path/to/test',
              authentication: true,
              type: 'mongodb',
              _: ['generate', 'service']
            },
            { cwd }
          )
        )
        const testResult = await context.pinion.exec('npm', ['test'], { cwd })

        assert.ok(connectionContext)
        assert.ok(mongoServiceContext)
        assert.strictEqual(testResult, 0)
      })

      it('generates a custom service and passes tests', async () => {
        const customServiceContext = await generate(
          getContext<ServiceGeneratorArguments>(
            {
              dependencyVersions,
              name: 'Custom Service',
              path: 'custom',
              authentication: false,
              type: 'custom',
              _: ['generate', 'service']
            },
            { cwd }
          )
        )
        const testResult = await context.pinion.exec('npm', ['test'], { cwd })

        assert.ok(customServiceContext)
        assert.strictEqual(testResult, 0)
      })

      it('compiles successfully', async () => {
        console.log(cwd)
        if (language === 'ts' && framework === 'koa') {
          const testResult = await context.pinion.exec('npm', ['run', 'compile'], { cwd })

          assert.strictEqual(testResult, 0)
        }
      })
    })
  }
})
