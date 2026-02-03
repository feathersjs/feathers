import { toFile, writeJSON } from '@featherscloud/pinion'
import type { AppGeneratorContext } from '../commons.js'

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
  feathers: {
    packager,
    platform
  }
})

export const generate = (ctx: AppGeneratorContext) =>
  Promise.resolve(ctx).then(writeJSON(packageJson, toFile('package.json')))
