import { strict as assert } from 'assert';
import { AuthenticationRequest } from '@feathersjs/authentication/lib';
import { Params } from '@feathersjs/feathers';
import { setup, OAuthStrategy } from '../src';

class TestOAuthStrategy extends OAuthStrategy {
  async getProfile (data: AuthenticationRequest, _params: Params) {
    return {};
  }
}

describe('@feathersjs/authentication-oauth/strategy', () => {
  it('initializes', () => {
    assert.equal(typeof setup, 'function');
  });
});
