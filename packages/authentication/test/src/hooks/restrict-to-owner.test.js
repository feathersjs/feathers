import { expect } from 'chai';
import sinon from 'sinon';
import { restrictToOwner } from '../../../src/hooks';

let MockData;
let MockService;

describe('restrictToOwner', () => {
  beforeEach(() => {
    MockData = {
      userId: '1',
      text: 'hey'
    };
    MockService = {
      get: sinon.stub().returns(Promise.resolve(MockData))
    };
  });

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

  describe('when not called with an id', () => {
    it('throws an error', () => {
      let hook = {
        type: 'before'
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
        id: '1',
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
        id: '1',
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
        id: '1',
        type: 'before',
        params: {
          provider: 'rest',
          user: { _id: '1' }
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
          restrictToOwner()(hook);
        }
        catch(error) {
          expect(error).to.not.equal(undefined);
        }
      });
    });

    describe('when resource is missing owner id', () => {
      it('returns a Forbidden error', done => {
        let fn = restrictToOwner({ ownerField: 'user' });

        fn.call(MockService, hook).then(done).catch(error => {
          expect(error.code).to.equal(403);
          done();
        });
      });
    });

    describe('when user is not an owner', () => {
      it('returns a Forbidden error', done => {
        hook.params.user._id = '2';
        let fn = restrictToOwner();

        fn.call(MockService, hook).then(done).catch(error => {
          expect(error.code).to.equal(403);
          done();
        });
      });
    });

    describe('when user owns the resource', () => {
      it('does nothing', done => {
        let fn = restrictToOwner();

        fn.call(MockService, hook).then(returnedHook => {
          expect(returnedHook).to.deep.equal(hook);
          done();
        }).catch(done);
      });
    });
  });
});