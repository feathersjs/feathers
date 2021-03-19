import { strict as assert } from 'assert';
import { Server } from 'http';
import axios from 'axios';
import { app } from './fixture';

describe('@feathersjs/authentication-oauth/express', () => {
  let server: Server;

  before(async () => {
    server = await app.listen(9876);
  });

  after(() => server.close());

  it('oauth/test', async () => {
    try {
      await axios.get('http://localhost:9876/oauth/test?feathers_token=testing', { maxRedirects: 0 });
    } catch (error) {
      assert.equal(error.response.status, 302)
    }
  });

  it('oauth/test with query', async () => {
    try {
      await axios.get('http://localhost:9876/oauth/test?other=test', { maxRedirects: 0 });
    } catch (error) {
      assert.equal(error.response.status, 302)
    }
  });

  it('oauth/test/authenticate', async () => {
    const { data } = await axios.get('http://localhost:9876/oauth/test/authenticate?profile[sub]=expressTest');

    assert.ok(data.accessToken);
    assert.equal(data.user.testId, 'expressTest');
    assert.equal(data.fromMiddleware, 'testing');
  });

  it('oauth/test/authenticate with redirect', async () => {
    app.get('authentication').oauth.redirect = '/';

    try {
      await axios.get('http://localhost:9876/oauth/test/authenticate');
    } catch (error) {
      assert.ok(/Cannot GET/.test(error.response.data));
      delete app.get('authentication').oauth.redirect;
    }
  });
});
