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
import { generate as generateAuthentication } from '../lib/authentication'
import { generate as generateService } from '../lib/service'
import { listAllFiles } from '@feathershq/pinion/lib/utils'
import { AuthenticationGeneratorArguments } from '../src/authentication'

const matrix = {
  language: ['js', 'ts'] as const,
  framework: ['koa', 'express'] as const,
  schema: ['typebox', 'json'] as const
}

const defaultCombination = {
  language: process.env.FEATHERS_LANGUAGE || 'ts',
  framework: process.env.FEATHERS_FRAMEWORK || 'koa',
  schema: process.env.FEATHERS_SCHEMA || 'typebox'
}

const combinations =
  process.version > 'v16.0.0' ? (process.env.CI ? combinate(matrix as any) : [defaultCombination]) : []

describe('@feathersjs/generators', () => {
  for (const { language, framework, schema } of combinations) {
    describe(`${language} ${framework} app`, () => {
      const name = `feathers_${language}_${framework}_${schema}`

      let context: FeathersBaseContext
      let cwd: string

      before(async () => {
        cwd = await mkdtemp(path.join(os.tmpdir(), name + '-'))
        console.log(`\nGenerating test application to\n${cwd}\n\n`)

        try {
          context = await generateApp(
            getContext<AppGeneratorContext>(
              {
                name,
                framework,
                language,
                dependencyVersions,
                client: true,
                lib: 'src',
                description: 'A Feathers test app',
                packager: 'npm',
                database: 'sqlite',
                connectionString: `${name}.sqlite`,
                transports: ['rest', 'websockets'],
                schema
              },
              { cwd }
            )
          )
        } catch (error: any) {
          console.error(error.stack)
          console.error((await listAllFiles(cwd)).join('\n'))
          throw error
        }
      })

      it('generated app with SQLite and passes tests', async () => {
        const testResult = await context.pinion.exec('npm', ['test'], { cwd })

        assert.ok(context)
        assert.strictEqual(testResult, 0)
      })

      it('generates authentication with database and passes tests', async () => {
        const authContext = await generateAuthentication(
          getContext<AuthenticationGeneratorArguments>(
            {
              dependencyVersions,
              authStrategies: ['local', 'github'],
              entity: 'user',
              service: 'user',
              path: 'users',
              schema
            },
            { cwd }
          )
        )
        const testResult = await context.pinion.exec('npm', ['test'], { cwd })

        assert.ok(authContext)
        assert.strictEqual(testResult, 0)
      })

      it('generates a MongoDB connection and service and passes tests', async () => {
        const connectionContext = await generateConnection(
          getContext<ConnectionGeneratorArguments>(
            {
              dependencyVersions,
              database: 'mongodb' as const,
              connectionString: `mongodb://127.0.0.1:27017/${name}`
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
              schema
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
              schema
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
