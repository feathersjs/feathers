import { expect } from 'chai';
import { restrictToRoles } from '../../../src/hooks';

const options = { roles: ['admin', 'super'] };

describe('restrictToRoles', () => {
  it('throws an error when roles are missing', () => {
    try {
      restrictToRoles();
    }
    catch(error) {
      expect(error).to.not.equal(undefined);
    }
  });

  it('throws an error when roles are empty', () => {
    try {
      restrictToRoles({ roles: [] });
    }
    catch(error) {
      expect(error).to.not.equal(undefined);
    }
  });

  describe('when not called as a before hook', () => {
    it('throws an error', () => {
      let hook = {
        type: 'after'
      };

      try {
        restrictToRoles(options)(hook);
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
        var returnedHook = restrictToRoles(options)(hook);
        expect(returnedHook).to.deep.equal(hook);
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
        hook = restrictToRoles(options)(hook);
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
          user: {
            _id: '1',
            roles: ['admin']
          },
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
          restrictToRoles(options)(hook);
        }
        catch(error) {
          expect(error).to.not.equal(undefined);
        }
      });
    });

    describe('when user is missing fieldName', () => {
      it('throws a Forbidden error', () => {
        let hook = {
          type: 'before',
          params: {
            provider: 'rest',
            user: {
              _id: '1'
            },
            query: {}
          },
          app: {
            get: function() { return {}; }
          }
        };

        try {
          restrictToRoles(options)(hook);
        }
        catch(error) {
          expect(error.code).to.equal(403);
        }
      });
    });

    describe('when user is missing the role', () => {
      let hook;

      beforeEach(() => {
        hook = {
          type: 'before',
          params: {
            provider: 'rest',
            user: {
              '_id': '1',
              roles: ['user']
            },
            query: {}
          },
          app: {
            get: function() { return {}; }
          }
        };
      });

      it('throws a Forbidden error', () => {
        try {
          restrictToRoles(options)(hook);
        }
        catch(error) {
          expect(error.code).to.equal(403);
        }
      });

      it('adds user id to query when owner option is present', () => {
        restrictToRoles({ roles: ['admin'], owner: true })(hook);
        expect(hook.params.query.userId).to.equal('1');
      });
    });

    describe('when user has role', () => {
      let hook;

      beforeEach(() => {
        hook = {
          type: 'before',
          params: {
            provider: 'rest',
            user: {
              '_id': '1',
              roles: ['admin']
            },
            query: {}
          },
          app: {
            get: function() { return {}; }
          }
        };
      });

      it('does not throw an error using default options', () => {
        try {
          restrictToRoles(options)(hook);
          expect(true).to.equal(true);
        }
        catch (e) {
          // Should never get here
          expect(true).to.equal(false);
        }
      });

      it('does not throw an error when user role field is singular', () => {
        hook.params.user.roles = 'admin';
        
        try {
          restrictToRoles(options)(hook);
          expect(true).to.equal(true);
        }
        catch (e) {
          // Should never get here
          expect(true).to.equal(false);
        }
      });

      it('does not throw an error using global auth config', () => {
        hook.params.user.id = '2';
        hook.params.user.role = 'admin';
        hook.app.get = function() {
          return { idField: 'id', ownerField: 'ownerId', fieldName: 'role' };
        };

        try {
          restrictToRoles(options)(hook);
          expect(true).to.equal(true);
        }
        catch (e) {
          // Should never get here
          expect(true).to.equal(false);
        }
      });

      it('does not throw an error using custom options', () => {
        hook.params.user.id = '2';
        hook.params.user.permissions = ['super'];

        try {
          restrictToRoles({ roles: options.roles, idField: 'id', ownerField: 'ownerId', fieldName: 'permissions' })(hook);
          expect(true).to.equal(true);
        }
        catch (e) {
          // Should never get here
          expect(true).to.equal(false);
        }
      });
    });
  });
});