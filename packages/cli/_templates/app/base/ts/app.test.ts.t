---
to: "<%= h.test %>/app.test.ts"
---
import assert from 'assert';
import axios from 'axios';
import { Server } from 'http';
import { app } from '../<%= h.lib %>/app';

const port = app.get('port');
const appUrl = `http://${app.get('host')}:${port}`;

describe('Feathers application tests', () => {
  let server: Server;

  before(async () => {
    server = await app.listen(port);
  });

  after(done => {
    server.close(done);
  });

  it('starts and shows the index page', async () => {
    const { data } = await axios.get(appUrl);

    assert.ok(data.indexOf('<html lang="en">') !== -1);
  });

  it('shows a 404 JSON error', async () => {
    try {
      await axios.get(`${appUrl}/path/to/nowhere`, {
        responseType: 'json'
      });
      assert.fail('should never get here');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { response } = error
        assert.strictEqual(response?.status, 404)
        assert.strictEqual(response?.data?.code, 404)
        assert.strictEqual(response?.data?.name, 'NotFound')
      } else {
        assert.fail('Response is not an AxiosError')
      }
    }
  });
});
