import { strict as assert } from 'assert';
import { getRedirect, getDefaultSettings } from '../src/utils';
import { app } from './fixture';
import { AuthenticationService } from '@feathersjs/authentication/lib';

describe('@feathersjs/authentication-oauth/utils', () => {
  it('getRedirect', async () => {
    const service: AuthenticationService = app.service('authentication');

    app.get('authentication').oauth.redirect = '/home';

    let redirect = await getRedirect(service, { accessToken: 'testing' });
    assert.equal(redirect, '/home#access_token=testing');

    redirect = await getRedirect(service, { message: 'something went wrong' });
    assert.equal(redirect, '/home#error=something%20went%20wrong');

    redirect = await getRedirect(service, {});
    assert.equal(redirect, '/home#error=OAuth%20Authentication%20not%20successful');

    app.get('authentication').oauth.redirect = '/home?';
    
    redirect = await getRedirect(service, { accessToken: 'testing' });
    assert.equal(redirect, '/home?access_token=testing');

    delete app.get('authentication').oauth.redirect;

    redirect = await getRedirect(service, { accessToken: 'testing' });
    assert.equal(redirect, null);
  });

  it('getDefaultSettings', () => {
    const settings = getDefaultSettings(app);

    assert.equal(settings.path, '/auth');
    assert.equal(settings.authService, 'authentication');
    assert.equal(settings.linkStrategy, 'jwt');
  });
});
