import os from 'os';
import path from 'path';
import fs from 'fs';
import assert from 'assert';
import execa from 'execa';
import { generate } from '../src';

const { mkdtemp } = fs.promises;

describe('@feathersjs/cli', () => {
  const oldCwd = process.cwd();
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'feathers-'));
    process.chdir(tmpDir);
  });

  afterEach(() => process.chdir(oldCwd));

  it('generates an app and passes tests', async () => {
    const prompts = {
      language: 'js',
      name: 'feathers-cli-test',
      description: 'The Feathers CLI test app',
      lib: 'src',
      packager: 'npm',
      database: 'sequelize',
      tester: 'mocha',
      framework: 'express',
      transports: [
        'rest',
        'websockets'
      ]
    }
    // Emulates a `feathers generate app`
    const result = await generate({
      generator: 'app',
      action: 'new',
      args: {}
    }, {
      createPrompter () {
        return {
          async prompt () {
            return prompts;
          }
        } as any;
      }
    });

    assert.ok(result.actions);

    const command = execa.command('npm test', { shell: true });

    command.stderr.pipe(process.stderr);

    const { exitCode } = await command;

    assert.strictEqual(exitCode, 0, `Error in ${tmpDir}`);
  });
});
