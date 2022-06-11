/* eslint-disable @typescript-eslint/prefer-for-of */
import os from 'os'
import path from 'path'
import { mkdtemp } from 'fs/promises'
import assert from 'assert'
import { getContext } from '@feathershq/pinion'

import { generate } from '../lib'
import { AppGeneratorData, AppGeneratorContext } from '../src/app'

// const matrix = {
//   language: ['js', 'ts'] as const,
//   framework: ['koa', 'express'] as const
// }

// const defaultCombination = {
//   language: process.env.FEATHERS_LANGUAGE || 'ts',
//   framework: process.env.FEATHERS_FRAMEWORK || 'koa'
// }

const defaultCombination = {
  language: 'ts',
  framework: 'koa'
}

function combinate<O extends Record<string | number, any[]>>(obj: O) {
  let combos: { [k in keyof O]: O[k][number] }[] = []
  for (const key of Object.keys(obj)) {
    const values = obj[key]
    const all = []
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < (combos.length || 1); j++) {
        const newCombo = { ...combos[j], [key]: values[i] }
        all.push(newCombo)
      }
    }
    combos = all
  }
  return combos
}

const combinations = [defaultCombination]
// process.version > 'v16.0.0' ? (process.env.CI ? combinate(matrix as any) : [defaultCombination]) : []

describe('@feathersjs/cli', () => {
  for (const { language, framework } of combinations) {
    it(`generates ${language} ${framework} app and passes tests`, async () => {
      const name = `feathers_${language}_${framework}`
      const cwd = await mkdtemp(path.join(os.tmpdir(), name + '-'))
      const settings: AppGeneratorData = {
        framework,
        language,
        name,
        lib: 'src',
        description: 'A Feathers test app',
        packager: 'npm',
        database: 'mongodb',
        connectionString: 'mongodb://localhost:27017/feathersapp',
        transports: ['rest', 'websockets'],
        authStrategies: ['local', 'github']
      }
      const context = getContext<AppGeneratorContext>(
        {
          ...settings,
          _: ['generate', 'app']
        },
        { cwd }
      )
      const finalContext = await generate(context)
      const testResult = await context.pinion.exec('npm', ['test'], { cwd })

      assert.ok(finalContext)
      assert.strictEqual(testResult, 0)
    })
  }
})
