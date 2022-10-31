/* eslint-disable @typescript-eslint/prefer-for-of */
import os from 'os'
import path from 'path'
import { mkdtemp } from 'fs/promises'
import assert from 'assert'
import { getContext } from '@feathershq/pinion'

import { AppGeneratorContext } from '../src/app'
import { FeathersBaseContext } from '../src/commons'
import { ConnectionGeneratorArguments } from '../src/connection'
import { ServiceGeneratorArguments } from '../src/service'
import { combinate, dependencyVersions } from './utils'

import { generate as generateApp } from '../lib/app'
import { generate as generateConnection } from '../lib/connection'
import { generate as generateService } from '../lib/service'

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
        console.log(cwd)
        context = await generateApp(
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
              schema: 'typebox'
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
        const connectionContext = await generateConnection(
          getContext<ConnectionGeneratorArguments>(
            {
              dependencyVersions,
              database: 'mongodb' as const,
              connectionString: `mongodb://localhost:27017/${name}`
            },
            { cwd }
          )
        )
        const mongoService1Context = await generateService(
          getContext<ServiceGeneratorArguments>(
            {
              dependencyVersions,
              name: 'testing',
              path: 'path/to/test',
              authentication: true,
              type: 'mongodb',
              schema: false
            },
            { cwd }
          )
        )
        const messageServiceContext = await generateService(
          getContext<ServiceGeneratorArguments>(
            {
              dependencyVersions,
              name: 'message',
              path: 'messages',
              authentication: true,
              type: 'mongodb',
              schema: 'typebox'
            },
            { cwd }
          )
        )
        const testResult = await context.pinion.exec('npm', ['test'], { cwd })

        assert.ok(connectionContext)
        assert.ok(mongoService1Context)
        assert.ok(messageServiceContext)
        assert.strictEqual(testResult, 0)
      })

      it('generates a custom service and passes tests', async () => {
        const customServiceContext = await generateService(
          getContext<ServiceGeneratorArguments>(
            {
              dependencyVersions,
              name: 'Custom',
              path: 'customized',
              authentication: false,
              type: 'custom',
              schema: 'json'
            },
            { cwd }
          )
        )
        const testResult = await context.pinion.exec('npm', ['test'], { cwd })

        assert.ok(customServiceContext)
        assert.strictEqual(testResult, 0)
      })

      it('compiles successfully', async () => {
        if (language === 'ts' && framework === 'koa') {
          const testResult = await context.pinion.exec('npm', ['run', 'compile'], { cwd })

          assert.strictEqual(testResult, 0)
        }
      })
    })
  }
})
