import { toFile, writeJSON } from '@featherscloud/pinion'
import type { AppGeneratorContext } from '../commons.js'

const startCommands = {
  node: 'tsx src/index.ts',
  deno: 'deno run --unstable-sloppy-imports --allow-net src/index.ts',
  bun: 'bun src/index.ts'
}

const packageJson = ({ name, description, packager, platform }: AppGeneratorContext) => ({
  name,
  description,
  version: '0.0.0',
  homepage: '',
  private: true,
  keywords: ['feathers'],
  author: {},
  contributors: [] as string[],
  bugs: {},
  type: 'module',
  scripts: {
    start: startCommands[platform] || 'echo "No start command available for this platform"'
  },
  feathers: {
    packager,
    platform
  }
})

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(writeJSON(packageJson, toFile('package.json')))
