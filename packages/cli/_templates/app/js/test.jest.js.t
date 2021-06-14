---
to: "<%= h.feathers.tester === 'jest' ? `${h.test}/app.test.js` : null %>"
---
import assert from 'assert';
import axios from 'axios';
import { app } from '../<%= h.lib %>/app.js';

const port = app.get('port');
const appUrl = `http://${app.get('host')}:${port}`;

describe('Feathers application tests', () => {
  let server;

  beforeAll(async => {
    server = await app.listen(port);
  });

  afterAll(done => {
    server.close(done);
  });

  it('starts and shows the index page', async () => {
    expect.assertions(1);

    const { data } = await axios.get(appUrl);

    expect(data.indexOf('<html lang="en">')).not.toBe(-1);
  });

  it('shows a 404 JSON error', async () => {
    expect.assertions(4);
    
    try {
      await axios.get(`${appUrl}/path/to/nowhere`, {
        json: true
      });
    } catch (error) {
      const { response } = error;

      expect(response.status).toBe(404);
      expect(response.data.code).toBe(404);
      expect(response.data.message).toBe('Page not found');
      expect(response.data.name).toBe('NotFound');
    }
  });
});