import { generator, renderTemplate, toFile } from '@feathershq/pinion'
import { AppGeneratorContext } from '../index'

const template = ({ lib }: AppGeneratorContext) =>
`import assert from 'assert'
import axios from 'axios'
import { app } from '../${lib}/app.js'

const port = app.get('port')
const appUrl = \`http://\${app.get('host')}:\${port}\`

describe('Feathers application tests', () => {
  let server

  before(async () => {
    server = await app.listen(port)
  })

  after(done => {
    server.close(done)
  })

  it('starts and shows the index page', async () => {
    const { data } = await axios.get(appUrl)

    assert.ok(data.indexOf('<html lang="en">') !== -1)
  })

  it('shows a 404 JSON error', async () => {
    try {
      await axios.get(\`\${appUrl}/path/to/nowhere\`, {
        responseType: 'json'
      })
      assert.fail('should never get here')
    } catch (error) {
      const { response } = error

      assert.strictEqual(response.status, 404)
      assert.strictEqual(response.data.code, 404)
      assert.strictEqual(response.data.name, 'NotFound')
    }
  })
})
`

export const generate = (ctx: AppGeneratorContext) => generator(ctx)
  .then(renderTemplate(template, toFile('test', 'app.test.js')))
