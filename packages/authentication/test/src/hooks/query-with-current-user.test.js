import { expect } from 'chai';
import { queryWithCurrentUser } from '../../../src/hooks';

describe('queryWithCurrentUser', () => {
  describe('when not called as a before hook', () => {
    it('throws an error', () => {
      let hook = {
        type: 'after'
      };

      try {
        queryWithCurrentUser()(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });

  describe('when user does not exist', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        params: {},
        app: {
          get: function() { return {}; }
        }
      };
    });

    describe('when provider does not exist', () => {
      it('does not do anything', () => {
        try {
          var returnedHook = queryWithCurrentUser()(hook);
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
        queryWithCurrentUser()(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });

  describe('when user exists', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        params: {
          user: { _id: '1' },
          query: { text: 'Hi' }
        },
        app: {
          get: function() { return {}; }
        }
      };
    });

    describe('when user is missing idField', () => {
      it('throws an error', () => {
        let hook = {
          type: 'before',
          params: {
            user: {}
          }
        };

        try {
          queryWithCurrentUser()(hook);
        }
        catch(error) {
          expect(error).to.not.equal(undefined);
        }
      });
    });

    it('adds user id to query using default options', () => {
      queryWithCurrentUser()(hook);

      expect(hook.params.query.userId).to.equal('1');
    });

    it('adds user id to query using options from global auth config', () => {
      hook.params.user.id = '2';
      hook.app.get = function() {
        return { idField: 'id', as: 'customId' };
      };

      queryWithCurrentUser()(hook);

      expect(hook.params.query.customId).to.equal('2');
    });

    it('adds user id to query using custom options', () => {
      hook.params.user.id = '2';

      queryWithCurrentUser({ idField: 'id', as: 'customId' })(hook);

      expect(hook.params.query.customId).to.equal('2');
    });
  });
});