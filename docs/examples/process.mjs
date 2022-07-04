// Transpiles the files in examples/ts to JavaScript in examples/js
// And prettifies both files
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { readdir, readFile, writeFile } from 'fs/promises'
import { PRETTIERRC, getJavaScript, prettier } from '@feathersjs/cli'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

;(async () => {
  const sourcePath = path.join(__dirname, 'ts')
  const targetPath = path.join(__dirname, 'js')
  const list = await readdir(sourcePath, { withFileTypes: true })
  const fileNames = list.filter((file) => file.isFile()).map(({ name }) => name)
  const prettierOptions = {
    ...PRETTIERRC,
    printWidth: 80
  }

  for (const fileName of fileNames) {
    const targetTS = path.resolve(sourcePath, fileName)
    const targetJS = path.resolve(targetPath, fileName.replace(/.ts$/, '.js'))

    const content = (await readFile(path.resolve(sourcePath, fileName))).toString()
    const javascript = await getJavaScript(content)
    const formattedJS = await prettier.format(javascript, {
      ...prettierOptions,
      parser: 'babel'
    })
    const formattedTS = await prettier.format(content, {
      ...prettierOptions,
      parser: 'typescript'
    })

    await writeFile(targetTS, formattedTS)
    await writeFile(targetJS, formattedJS)
    console.log(`Wrote ${targetTS}\nWrote ${targetJS}`)
  }
})()
