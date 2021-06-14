import os from 'os';
import path from 'path';
import { mkdtemp } from 'fs/promises';
import assert from 'assert';
import { generator } from '../src';

describe('@feathersjs/cli', () => {
  let tmpDir: string;

  const appPrompts = {
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

  before(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'feathers-'));
  });

  it('generates and app', async () => {
    console.log(tmpDir);
    // Emulates a `feathers generate app`
    const { success } = await generator(['app'], {
      cwd: tmpDir,
      createPrompter () {
        return {
          async prompt () {
            return appPrompts;
          }
        } as any;
      }
    });

    assert.ok(success);
  });
});
