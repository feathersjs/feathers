import { expect } from 'chai';
import { populateHeader } from '../../src/hooks';

describe('hooks:populateHeader', () => {
  let hook;
  let options;

  beforeEach(() => {
    options = { header: 'Authorization' };
    hook = {
      type: 'before',
      params: {
        accessToken: 'my token',
        headers: {}
      }
    };
  });

  describe('when options.header is missing', () => {
    it('throws an error', () => {
      delete options.header;

      expect(() => {
        populateHeader(options);
      }).to.throw;
    });
  });

  describe('when not called as a before hook', () => {
    it('returns an error', () => {
      hook.type = 'after';

      return populateHeader(options)(hook).catch(error => {
        expect(error).to.not.equal(undefined);
      });
    });
  });

  describe('when accessToken is missing', () => {
    it('does nothing', () => {
      delete hook.params.accessToken;
      return populateHeader(options)(hook).then(newHook => {
        expect(newHook).to.deep.equal(hook);
      });
    });
  });

  describe('when accessToken is present', () => {
    it('adds the accessToken to authorization header', () => {
      return populateHeader(options)(hook).then(hook => {
        expect(hook.params.headers.Authorization).to.equal('my token');
      });
    });

    it('retains existing headers', () => {
      hook.params.headers = {
        authorization: 'existing',
        custom: 'custom'
      };

      return populateHeader(options)(hook).then(hook => {
        expect(hook.params.headers.authorization).to.equal('existing');
        expect(hook.params.headers.custom).to.equal('custom');
      });
    });

    it('supports a custom token header', () => {
      options.header = 'custom';
      return populateHeader(options)(hook).then(hook => {
        expect(hook.params.headers.custom).to.equal('my token');
      });
    });
  });
});
