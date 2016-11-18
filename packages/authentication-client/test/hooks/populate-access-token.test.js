import { expect } from 'chai';
import { populateAccessToken } from '../../src/hooks';

describe('hooks:populateAccessToken', () => {
  let hook;

  beforeEach(() => {
    hook = {
      type: 'before',
      params: {},
      app: {
        get: () => 'my token'
      }
    };
  });

  describe('when not called as a before hook', () => {
    it('returns an error', () => {
      hook.type = 'after';

      return populateAccessToken()(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  it('adds the accessToken to hook.params', () => {
    return populateAccessToken()(hook).then(hook => {
      expect(hook.params.accessToken).to.equal('my token');
    });
  });
});
