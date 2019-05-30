import { strict as assert } from 'assert';
import { Server } from 'http';
import axios from 'axios';
import { app } from './fixture';

describe('@feathersjs/authentication-oauth/express', () => {
  let server: Server;

  before(async () => {
    server = app.listen(9876);

    await new Promise(resolve => server.once('listening', () => resolve()));
  });

  after(() => server.close());

  it('oauth/test', async () => {
    axios.get('http://localhost:9876/oauth//test?feathers_token=testing');
  });

  it('oauth/test with query', async () => {
    axios.get('http://localhost:9876/oauth//test?other=test');
  });

  it('oauth/test/authenticate', async () => {
    const { data } = await axios.get('http://localhost:9876/oauth//test/authenticate?id=expressTest');

    assert.ok(data.accessToken);
    assert.equal(data.user.testId, 'expressTest');
  });

  it('oauth/test/authenticate with redirect', async () => {
    app.get('authentication').oauth.redirect = '/';

    try {
      await axios.get('http://localhost:9876/oauth//test/authenticate');
    } catch (error) {
      assert.ok(/Cannot GET/.test(error.response.data));
      delete app.get('authentication').oauth.redirect;
    }
  });

  it('oauth/test/authenticate with error', async () => {
    try {
      await axios.get('http://localhost:9876/oauth//test/authenticate');
    } catch (error) {
      assert.equal(error.response.data.message, 'Data needs an id');
    }
  });
});
