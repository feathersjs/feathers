import { expect } from 'chai';
import sinon from 'sinon';
import { restrictToRoles } from '../../../src/hooks';

let MockData;
let MockService;
let options;

describe('restrictToRoles', () => {
  beforeEach(() => {
    MockData = {
      userId: '1',
      text: 'hey'
    };
    MockService = {
      get: sinon.stub().returns(Promise.resolve(MockData))
    };
    options = { roles: ['admin', 'super'] };
  });

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
        id: '1',
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
        id: '1',
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
        id: '1',
        type: 'before',
        params: {
          provider: 'rest',
          user: {
            _id: '1',
            roles: ['admin']
          }
        },
        app: {
          get: function() { return {}; }
        }
      };
    });

    describe('when user is missing idField', () => {
      it('throws an error', () => {
        hook.params.user = {};

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
        hook.params.user = { _id: '1' };

        try {
          restrictToRoles(options)(hook);
        }
        catch(error) {
          expect(error.code).to.equal(403);
        }
      });
    });

    describe('when user is missing the role', () => {
      beforeEach(() => {
        hook.params.user = {
          '_id': '1',
          roles: ['user']
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

      describe('when owner option enabled', () => {
        beforeEach(() => {
          options.owner = true;
        });

        describe('when not called with an id', () => {
          it('throws an error', () => {
            hook.id = undefined;

            try {
              restrictToRoles(options)(hook);
            }
            catch(error) {
              expect(error).to.not.equal(undefined);
            }
          });
        });

        describe('when resource is missing owner id', () => {
          it('returns a Forbidden error', done => {
            options.ownerField = 'user';
            let fn = restrictToRoles(options);

            fn.call(MockService, hook).then(done).catch(error => {
              expect(error.code).to.equal(403);
              done();
            });
          });
        });

        describe('when user is not an owner', () => {
          it('returns a Forbidden error', done => {
            hook.params.user._id = '2';
            let fn = restrictToRoles(options);

            fn.call(MockService, hook).then(done).catch(error => {
              expect(error.code).to.equal(403);
              done();
            });
          });
        });

        describe('when user owns the resource', () => {
          it('does nothing', done => {
            let fn = restrictToRoles(options);

            fn.call(MockService, hook).then(returnedHook => {
              expect(returnedHook).to.deep.equal(hook);
              done();
            }).catch(done);
          });
        });
      });
    });

    describe('when user has role', () => {
      let hook;

      beforeEach(() => {
        hook = {
          id: '1',
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