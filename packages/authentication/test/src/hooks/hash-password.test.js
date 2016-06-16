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

  describe('when data does not exist', () => {
    it('does not do anything', () => {
      let hook = {
        type: 'before',
        app: {
          get: function() { return {}; }
        }
      };

      try {
        var returnedHook = hashPassword()(hook);
        expect(returnedHook).to.deep.equal(hook);
      }
      catch(error) {
        // It should never get here
        expect(true).to.equal(false);
      }
    });
  });

  describe('when password does not exist', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        data: {},
        params: {},
        app: {
          get: function() { return {}; }
        }
      };
    });

    describe('when provider does not exist', () => {
      it('does not do anything', () => {
        try {
          var returnedHook = hashPassword()(hook);
          expect(returnedHook).to.deep.equal(hook);
        }
        catch(error) {
          // It should never get here
          expect(true).to.equal(false);
        }
      });
    });

    it('throws an error', () => {
      hook.params.provider = 'rest';

      try {
        hashPassword()(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });

  describe('when password exists', () => {
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

  describe('when password exists in bulk', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        data: [{password: 'secret'}, {password: 'secret'}],
        app: {
          get: function() { return {}; }
        }
      };
    });

    it('hashes with default options', (done) => {
      hashPassword()(hook).then(hook => {
        hook.data.map(item => {
          expect(item.password).to.not.equal(undefined);
          expect(item.password).to.not.equal('secret');
        });
        done();
      });
    });

    it('hashes with options from global auth config', (done) => {
      hook.data = [{pass: 'secret'}, {pass: 'secret'}];
      hook.app.get = function() {
        return { passwordField: 'pass' };
      };

      hashPassword()(hook).then(hook => {
        hook.data.map(item => {
          expect(item.pass).to.not.equal(undefined);
          expect(item.pass).to.not.equal('secret');
        });
        done();
      });
    });

    it('hashes with custom options', (done) => {
      hook.data = [{pass: 'secret'}, {pass: 'secret'}];

      hashPassword({ passwordField: 'pass'})(hook).then(hook => {
        hook.data.map(item => {
          expect(item.pass).to.not.equal(undefined);
          expect(item.pass).to.not.equal('secret');
        });
        done();
      });
    });
  });
});
