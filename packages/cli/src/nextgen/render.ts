import path from 'path'
import walk from 'ignore-walk'

import type { RenderedAction, RunnerConfig, RenderResult } from './types'

const ignores = [
  'prompt.ts',
  'index.ts',
  '.hygenignore',
  '.DS_Store',
  '.Spotlight-V100',
  '.Trashes',
  'thumbs.db',
  'Thumbs.db'
]

function getFiles (dir: string): string[] {
  const files = walk
    .sync({ path: dir, ignoreFiles: ignores })
    .map(f => path.join(dir, f))
  return files;
}

const render = async (
  args: any,
  config: RunnerConfig
): Promise<RenderedAction[]> => {
  let files = getFiles(args.actionfolder);
  files = files.sort((a, b) => a.localeCompare(b));
  files = files.filter(file =>
    args.subaction
      ? file.replace(args.actionfolder, '').match(args.subaction)
      : true
  );

  let modules = await Promise.all(
    files.map((file) => import(file))
  );

  modules = modules.filter(x => x.render);

  const renderedResults: (RenderResult | undefined)[] = await Promise.all(
    modules.map(module => module.render({ ...args, h: config.helpers }))
  );

  return renderedResults.map(rendered => {
    const { body, ...attributes } = rendered;
    const result: RenderedAction = {
      attributes,
      body
    }
    return result;
  })
}

export default render