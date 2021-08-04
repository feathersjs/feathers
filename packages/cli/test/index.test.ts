import os from 'os';
import path from 'path';
import fs from 'fs';
import assert from 'assert';
import { generate } from '../src';

const { mkdtemp } = fs.promises;

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
    framework: 'koa',
    transports: [
      'rest',
      'websockets'
    ]
  }

  before(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'feathers-'));
  });

  it('generates and app', async () => {
    // Emulates a `feathers generate app`
    const result = await generate({
      generator: 'app',
      action: 'create',
      args: {}
    }, {
      cwd: tmpDir,
      createPrompter () {
        return {
          async prompt () {
            return appPrompts;
          }
        } as any;
      }
    });

    assert.ok(result.actions);
  });
});
