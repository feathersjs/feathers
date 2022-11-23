import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const template = ({ lib }: AppGeneratorContext) => /* ts */ `import assert from 'assert'
import axios from 'axios'
import type { Server } from 'http'
import { readFileSync } from 'fs'
import { app } from '../${lib}/app'

const port = app.get('port')
const appUrl = \`http://\${app.get('host')}:\${port}\`

describe('Feathers application tests', () => {
  let server: Server

  before(async () => {
    server = await app.listen(port)
  })

  after(async () => {
    await app.teardown()
  })

  it('starts and shows the index page', async () => {
    const res = await axios.get<string>(appUrl)
    const { data } = res

    try {
      assert.ok(data.indexOf('<html lang="en">') !== -1)
    } catch (error) {
      console.error(data.toString())
      console.error(res)
      console.log('Index file is')
      console.log(readFileSync('public/index.html', 'utf8').toString())
      throw error
    }
  })

  it('shows a 404 JSON error', async () => {
    try {
      await axios.get(\`\${appUrl}/path/to/nowhere\`, {
        responseType: 'json'
      })
      assert.fail('should never get here')
    } catch (error: any) {
      const { response } = error
      assert.strictEqual(response?.status, 404)
      assert.strictEqual(response?.data?.code, 404)
      assert.strictEqual(response?.data?.name, 'NotFound')
    }
  })
})
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(renderSource(template, toFile('test', 'app.test')))
