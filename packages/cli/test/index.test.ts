/* eslint-disable @typescript-eslint/prefer-for-of */
import os from 'os';
import path from 'path';
import fs from 'fs';
import assert from 'assert';
import execa from 'execa';
import { generate } from '../src';

const { mkdtemp } = fs.promises;
const matrix = {
  language: ['js', 'ts'],
  framework: ['koa', 'express']
}
const defaultCombination = {
  language: 'js',
  framework: 'koa'
}

function combinate<O extends Record<string | number, any[]>> (obj: O) {
  let combos: { [k in keyof O]: O[k][number] }[] = [];
  for (const key of Object.keys(obj)) {
    const values = obj[key];
    const all = [];
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < (combos.length || 1); j++) {
        const newCombo = { ...combos[j], [key]: values[i] };
        all.push(newCombo);
      }
    }
    combos = all;
  }
  return combos;
}
// Github CI can't handle the matrix... GITHUB_REF is refs/heads/feature-branch-1
const combinations = process.env.CI && !process.env.GITHUB_REF ? combinate(matrix) : [defaultCombination];

describe('@feathersjs/cli', () => {
  const oldCwd = process.cwd();

  afterEach(() => process.chdir(oldCwd));

  for (const { language, framework } of combinations) {
    it(`generates ${language} ${framework} app and passes tests`, async () => {
      const name = `feathers_${language}_${framework}`;
      const tmpDir = await mkdtemp(path.join(os.tmpdir(), name + '-'));
      const appPrompts = {
        framework,
        language,
        name: name,
        description: 'The Feathers CLI test app',
        lib: 'src',
        packager: 'npm',
        database: 'sequelize',
        transports: [
          'rest',
          'websockets'
        ]
      }
      const servicePrompts = {
        name: 'test',
        path: 'tests'
      }
      // Emulates a `feathers generate app`
      const appResult = await generate({
        generator: 'app',
        action: 'new',
        args: {}
      }, {
        createPrompter () {
          return {
            async prompt () {
              return appPrompts;
            }
          } as any;
        }
      });

      assert.ok(appResult.actions);

      // Emulates a `feathers generate app`
      const serviceResult = await generate({
        generator: 'custom',
        action: 'service',
        args: {}
      }, {
        createPrompter () {
          return {
            async prompt () {
              return servicePrompts;
            }
          } as any;
        }
      });

      assert.ok(serviceResult.actions);

      const command = execa.command('npm test', { shell: true });

      command.stderr.pipe(process.stderr);

      const { exitCode } = await command;

      assert.strictEqual(exitCode, 0, `Error in ${tmpDir}`);
    });
  }
});
