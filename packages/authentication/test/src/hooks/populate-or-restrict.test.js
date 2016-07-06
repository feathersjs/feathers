import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { populateOrRestrict } from '../../../src/hooks';

chai.use(sinonChai);

const fn = sinon.stub();
const mockFind = sinon.stub().returns(Promise.resolve([{text: 'test', approved: true}]));
const mockService = {
  find: mockFind
};

describe('populateOrRestrict', () => {
  describe('when payload is missing', () => {
    it('should merge the restriction in to the query and call find', () => {
      let hook = {
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

      hook = populateOrRestrict({ restrict: {approved: true} }).call(mockService, hook);
      expect(mockFind).to.be.calledWith({ query: {author: 'James', approved: true} }, { provider: undefined, query: { author: 'James' } });
    });

    it('if hook.id is set, merge the restriction and the id into the query and call find', () => {
      let hook = {
        id: '525235',
        app: {
          service: mockService,
          get: function() {}
        },
        type: 'before',
        params: {
          provider: 'rest'
        }
      };

      hook = populateOrRestrict({ restrict: {approved: true}, idField: '_id'}).call(mockService, hook);
      expect(mockFind).to.be.calledWith({ query:{'_id': '525235', approved: true} }, { provider: undefined });
    });
  });

  describe('when no user is found', () => {
    it('should merge the restriction in to the query and call find', () => {
      let hook = {
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

      hook = populateOrRestrict({ restrict: {approved: true} }).call(mockService, hook);
      expect(mockFind).to.be.calledWith({ query: {author: 'James', approved: true} }, { provider: undefined, query: { author: 'James' } });
    });

    it('if hook.id is set, merge the restriction and the id into the query and call find', () => {
      let hook = {
        id: '525235',
        app: {
          service: mockService,
          get: function() {}
        },
        type: 'before',
        params: {
          provider: 'rest'
        }
      };

      hook = populateOrRestrict({ restrict: {approved: true}, idField: '_id'}).call(mockService, hook);
      expect(mockFind).to.be.calledWith({ query:{'_id': '525235', approved: true} }, { provider: undefined });
    });
  });

  describe('when user id is missing', () => {
    it('does not do anything', done => {
      let hook = {
        type: 'before',
        params: {
          provider: 'rest',
          payload: {
            id: undefined
          }
        },
        app: {
          get: fn
        }
      };

      populateOrRestrict({ restrict: {approved: true} })(hook).then(returnedHook => {
        expect(hook).to.deep.equal(returnedHook);
        done();
      }).catch(done);
    });
  });

  describe('when not called as a before hook', () => {
    it('throws an error', () => {
      let hook = {
        type: 'after'
      };

      try {
        populateOrRestrict({restrict: {approved: true} })(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });
});
