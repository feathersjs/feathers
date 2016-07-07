import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import { hasRoleOrRestrict } from '../../../src/hooks';

let mockFind = sinon.stub().returns(Promise.resolve([{text: 'test', approved: true}]));
let mockService = {
  find: mockFind
};

let MockData;
let MockService;
let options;

describe('hasRoleOrRestrict', () => {
  beforeEach(() => {
    MockData = {
      userId: '1',
      text: 'hey'
    };
    MockService = {
      get: sinon.stub().returns(Promise.resolve(MockData)),
      find: mockFind
    };
    options = { roles: ['admin', 'super'], restrict: {approved: true} };
  });

  it('throws an error when roles are missing', () => {
    try {
      hasRoleOrRestrict();
    }
    catch(error) {
      expect(error).to.not.equal(undefined);
    }
  });

  it('throws an error when roles are empty', () => {
    try {
      hasRoleOrRestrict({ roles: [] });
    }
    catch(error) {
      expect(error).to.not.equal(undefined);
    }
  });

  describe('when not called as a before hook', () => {
    it('throws an error', () => {
      let hook = {
        type: 'after',
        method: 'find'
      };

      try {
        hasRoleOrRestrict(options)(hook);
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
        method: 'find',
        params: {}
      };

      try {
        var returnedHook = hasRoleOrRestrict(options)(hook);
        expect(returnedHook).to.deep.equal(hook);
      }
      catch(error) {
        // It should never get here
        expect(true).to.equal(false);
      }
    });
  });

  describe('when user does not exist', () => {
    it('should merge the restriction in to the query and call find', () => {
      let hook = {
        app: {
          service: mockService,
          get: function() {}
        },
        method: 'find',
        type: 'before',
        params: {
          provider: 'rest',
          query: {author: 'James'}
        }
      };

      hook = hasRoleOrRestrict({ roles: ['admin'], restrict: {approved: true} }).call(mockService, hook);
      expect(mockFind).to.be.calledWith({ query: {author: 'James', approved: true} }, { provider: undefined, query: { author: 'James' } });
    });

    it('if hook.id is set, merge the restriction and the id into the query and call find', () => {
      let hook = {
        id: '525235',
        app: {
          service: MockService,
          get: function() {}
        },
        method: 'find',
        type: 'before',
        params: {
          provider: 'rest'
        }
      };

      hook = hasRoleOrRestrict({ roles: ['admin'], restrict: {approved: true}, idField: '_id'}).call(mockService, hook);
      expect(mockFind).to.be.calledWith({ query:{'_id': '525235', approved: true} }, { provider: undefined });
    });
  });

  describe('when user exists', () => {
    let hook;

    beforeEach(() => {
      hook = {
        id: '1',
        type: 'before',
        method: 'find',
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
          hasRoleOrRestrict(options)(hook);
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
          hasRoleOrRestrict(options)(hook);
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

      it('should merge the restriction in to the query and call find', () => {
        let hook = {
          app: {
            service: mockService,
            get: function() {}
          },
          method: 'find',
          type: 'before',
          params: {
            provider: 'rest',
            query: {author: 'James'}
          }
        };

        hook = hasRoleOrRestrict({ roles: ['admin'], restrict: {approved: true} }).call(mockService, hook);
        expect(mockFind).to.be.calledWith({ query: {author: 'James', approved: true} }, { provider: undefined, query: { author: 'James' } });
      });

      it('if hook.id is set, merge the restriction and the id into the query and call find', () => {
        let hook = {
          id: '525235',
          method: 'find',
          app: {
            service: MockService,
            get: function() {}
          },
          type: 'before',
          params: {
            provider: 'rest'
          }
        };

        hook = hasRoleOrRestrict({ roles: ['admin'], restrict: {approved: true}, idField: '_id'}).call(mockService, hook);
        expect(mockFind).to.be.calledWith({ query:{'_id': '525235', approved: true} }, { provider: undefined });
      });

      describe('when owner option enabled', () => {
        beforeEach(() => {
          options.owner = true;
        });

        describe('when not called with an id', () => {
          it('throws an error', () => {
            hook.id = undefined;

            try {
              hasRoleOrRestrict(options)(hook);
            }
            catch(error) {
              expect(error).to.not.equal(undefined);
            }
          });
        });

        describe('when resource is missing owner id', () => {
          it('returns a Forbidden error', done => {
            options.ownerField = 'user';
            let fn = hasRoleOrRestrict(options);

            fn.call(MockService, hook).then(done).catch(error => {
              expect(error.code).to.equal(403);
              done();
            });
          });
        });

        describe('when user is not an owner', () => {
          it('returns a Forbidden error', done => {
            hook.params.user._id = '2';
            let fn = hasRoleOrRestrict(options);

            fn.call(MockService, hook).then(done).catch(error => {
              expect(error.code).to.equal(403);
              done();
            });
          });
        });

        describe('when user owns the resource', () => {
          it('does nothing', done => {
            let fn = hasRoleOrRestrict(options);

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
          method: 'find',
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
          hasRoleOrRestrict(options)(hook);
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
          hasRoleOrRestrict(options)(hook);
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
          hasRoleOrRestrict(options)(hook);
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
          hasRoleOrRestrict({ roles: options.roles, idField: 'id', ownerField: 'ownerId', fieldName: 'permissions' })(hook);
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
