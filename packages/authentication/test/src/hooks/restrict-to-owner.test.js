import { expect } from 'chai';
import { restrictToOwner } from '../../../src/hooks';

describe('restrictToOwner', () => {
  describe('when not called as a before hook', () => {
    it('throws an error', () => {
      let hook = {
        type: 'after'
      };

      try {
        restrictToOwner()(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });

  describe('when provider does not exist', () => {
    it('does not do anything', () => {
      let hook = {
        type: 'before',
        params: {}
      };

      try {
        var returnedHook = restrictToOwner()(hook);
        expect(hook).to.deep.equal(returnedHook);
      }
      catch(error) {
        // It should never get here
        expect(true).to.equal(false);
      }
    });
  });

  describe('when user does not exist', () => {
    it('throws a not authenticated error', () => {
      let hook = {
        type: 'before',
        params: {
          provider: 'rest'
        }
      };

      try {
        hook = restrictToOwner()(hook);
      }
      catch (error) {
        expect(error.code).to.equal(401);
      }
    });
  });

  describe('when user exists', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        params: {
          provider: 'rest',
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
            provider: 'rest',
            user: {},
            query: {}
          }
        };

        try {
          restrictToOwner()(hook);
        }
        catch(error) {
          expect(error).to.not.equal(undefined);
        }
      });
    });

    it('adds user id to query using default options', () => {
      restrictToOwner()(hook);

      expect(hook.params.query.userId).to.equal('1');
    });

    it('adds user id to query using options from global auth config', () => {
      hook.params.user.id = '2';
      hook.app.get = function() {
        return { idField: 'id', ownerField: 'ownerId' };
      };

      restrictToOwner()(hook);

      expect(hook.params.query.ownerId).to.equal('2');
    });

    it('adds user id to query using custom options', () => {
      hook.params.user.id = '2';

      restrictToOwner({ idField: 'id', ownerField: 'ownerId' })(hook);

      expect(hook.params.query.ownerId).to.equal('2');
    });
  });
});