import { expect } from 'chai';
import { hashPassword } from '../../../src/hooks';

describe('hashPassword', () => {
  describe('when not called as a before hook', () => {
    it('throws an error', () => {
      let hook = {
        type: 'after'
      };

      try {
        hashPassword()(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });

  describe('when hook.data does not exist', () => {
    it('does not do anything', () => {
      let hook = {
        type: 'before',
        foo: { password: 'password' },
        app: {
          get: function() { return {}; }
        }
      };

      hook = hashPassword()(hook);
      expect(hook.data).to.equal(undefined);
      expect(hook.foo.password).to.equal('password');
    });
  });

  describe('when hook.data exists', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        data: { password: 'secret' },
        app: {
          get: function() { return {}; }
        }
      };
    });

    it('hashes with default options', (done) => {
      hashPassword()(hook).then(hook => {
        expect(hook.data.password).to.not.equal(undefined);
        expect(hook.data.password).to.not.equal('secret');
        done();
      });
    });

    it('hashes with options from global auth config', (done) => {
      hook.data.pass = 'secret';
      hook.app.get = function() {
        return { passwordField: 'pass' };
      };

      hashPassword()(hook).then(hook => {
        expect(hook.data.pass).to.not.equal(undefined);
        expect(hook.data.pass).to.not.equal('secret');
        done();
      });
    });

    it('hashes with custom options', (done) => {
      hook.data.pass = 'secret';

      hashPassword({ passwordField: 'pass'})(hook).then(hook => {
        expect(hook.data.pass).to.not.equal(undefined);
        expect(hook.data.pass).to.not.equal('secret');
        done();
      });
    });
  });
});