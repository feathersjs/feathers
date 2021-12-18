import { RenderedAction, RunnerConfig } from './types'
import path from 'path'
import walk from 'ignore-walk'
import { RenderResult } from './types'

const ignores = [
  'prompt.js',
  'index.js',
  '.hygenignore',
  '.DS_Store',
  '.Spotlight-V100',
  '.Trashes',
  'ehthumbs.db',
  'Thumbs.db'
]

async function getFiles (dir: string): Promise<string[]> {
  const files = walk
    .sync({ path: dir, ignoreFiles: ['.hygenignore'] })
    .map(f => path.join(dir, f))
  return await Promise.all(files);
}

const render = async (
  args: any,
  config: RunnerConfig
): Promise<RenderedAction[]> => {
  let files = await getFiles(args.actionfolder);
  files = files.sort((a, b) => a.localeCompare(b));
  files = files.filter(f => !ignores.find(ig => f.endsWith(ig)));
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