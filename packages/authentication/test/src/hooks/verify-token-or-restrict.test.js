import jwt from 'jsonwebtoken';
import { verifyOrRestrict } from '../../../src/hooks';

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

const mockFind = sinon.stub().returns(Promise.resolve([{text: 'test', approved: true}]));
const mockService = {
  find: mockFind
};

describe('verifyOrRestrict', () => {
  describe('when not called as a before hook', () => {
    it('throws an error', () => {
      let hook = {
        type: 'after',
        method: 'find'
      };

      try {
        verifyOrRestrict()(hook);
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
        method: 'find',
        params: {}
      };

      try {
        var returnedHook = verifyOrRestrict()(hook);
        expect(hook).to.deep.equal(returnedHook);
      }
      catch(error) {
        // It should never get here
        expect(false).to.equal(true);
      }
    });
  });

  describe('when token does not exist', () => {
    it('should merge the restriction in to the query and call find', () => {
      let hook = {
        method: 'find',
        app: {
          service: mockService,
          get: function() {}
        },
        type: 'before',
        params: {
          provider: 'rest',
          query: {author: 'James'}
        }
      };

      hook = verifyOrRestrict({ restrict: {approved: true} }).call(mockService, hook);
      expect(mockFind).to.be.calledWith({ query: {author: 'James', approved: true} }, { provider: undefined, query: { author: 'James' } });
    });

    it('if hook.id is set, merge the restriction and the id into the query and call find', () => {
      let hook = {
        id: '525235',
        method: 'find',
        app: {
          service: mockService,
          get: function() {}
        },
        type: 'before',
        params: {
          provider: 'rest'
        }
      };

      hook = verifyOrRestrict({ restrict: {approved: true}, idField: '_id'}).call(mockService, hook);
      expect(mockFind).to.be.calledWith({ query:{'_id': '525235', approved: true} }, { provider: undefined });
    });
  });

  describe('when token exists', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        method: 'find',
        params: {
          provider: 'rest',
          token: 'valid_token'
        },
        app: {
          get: function() { return {}; }
        }
      };
    });

    describe('when secret is missing', () => {
      it('throws an error', () => {
        try {
          verifyOrRestrict()(hook);
        }
        catch(error) {
          expect(error).to.not.equal(undefined);
        }
      });
    });

    describe('when secret is present', () => {
      beforeEach(() => {
        hook.app.get = function() {
          return {
            token: {
              secret: 'secret'
            }
          };
        };
      });

      describe('when token is invalid', () => {
        it('returns a not authenticated error', done => {
          hook.params.token = 'invalid';

          verifyOrRestrict()(hook).then(done).catch(error => {
            expect(error.code).to.equal(401);
            done();
          });
        });
      });

      describe('when token is valid', () => {
        it('returns an error when options are not consistent', done => {
          let jwtOptions = {
            algorithm: 'HS512'
          };

          hook.app.get = function() {
            return {
              token: {
                secret: 'secret',
                algorithm: 'HS384'
              }
            };
          };

          hook.params.token = jwt.sign({ id: 1 }, 'secret', jwtOptions);

          verifyOrRestrict()(hook).then(() => {
            // should never get here
            expect(false).to.equal(true);
            done();
          }).catch(error => {
            expect(error.code).to.equal(401);
            done();
          });
        });

        it('adds token payload to params using options from global auth config', done => {
          let jwtOptions = {
            issuer: 'custom',
            audience: 'urn:feathers',
            algorithm: 'HS512',
            expiresIn: '1h' // 1 hour
          };

          hook.app.get = function() {
            return {
              token: {
                secret: 'secret',
                issuer: 'custom',
                audience: 'urn:feathers',
                algorithm: 'HS512'
              }
            };
          };

          hook.params.token = jwt.sign({ id: 1 }, 'secret', jwtOptions);

          verifyOrRestrict()(hook).then(hook => {
            expect(hook.params.payload.id).to.equal(1);
            done();
          }).catch(done);
        });

        it('adds token payload to params using custom options', done => {
          let jwtOptions = {
            issuer: 'feathers',
            expiresIn: '1h' // 1 hour
          };

          hook.params.token = jwt.sign({ id: 1 }, 'custom secret', jwtOptions);

          verifyOrRestrict({ secret: 'custom secret' })(hook).then(hook => {
            expect(hook.params.payload.id).to.equal(1);
            done();
          }).catch(done);
        });
      });
    });
  });
});
