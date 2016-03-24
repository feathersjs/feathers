import { expect } from 'chai';
import { associateCurrentUser } from '../../../src/hooks';

describe('associateCurrentUser', () => {
  describe('when not called as a before hook', () => {
    it('throws an error', () => {
      let hook = {
        type: 'after'
      };

      try {
        associateCurrentUser()(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });

  describe('when user is not logged in', () => {
    it('throws an error', () => {
      let hook = {
        type: 'before',
        params: {}
      };

      try {
        associateCurrentUser()(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });

  describe('options', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        params: {
          user: { _id: '1' }
        },
        app: {
          get: function() { return {}; }
        },
        data: { text: 'Hi' }
      };
    });

    it('has default options', () => {
      associateCurrentUser()(hook);

      expect(hook.data.userId).to.equal('1');
    });

    it('pulls from global auth config', () => {
      hook.params.user.id = '2';
      hook.app.get = function() {
        return { idField: 'id', as: 'customId' };
      };

      associateCurrentUser()(hook);

      expect(hook.data.customId).to.equal('2');
    });

    it('supports custom options', () => {
      hook.params.user.id = '2';

      associateCurrentUser({ idField: 'id', as: 'customId' })(hook);

      expect(hook.data.customId).to.equal('2');
    });
  });

  describe('when user is missing field', () => {
    it('throws an error', () => {
      let hook = {
        type: 'before',
        params: {
          user: {}
        }
      };

      try {
        associateCurrentUser()(hook);
      }
      catch(error) {
        expect(error).to.not.equal(undefined);
      }
    });
  });

  describe('when user has field', () => {
    let hook;

    beforeEach(() => {
      hook = {
        type: 'before',
        params: {
          user: { _id: '1' }
        },
        app: {
          get: function() { return {}; }
        }
      };
    });

    it('adds the user\'s ID to a single object', () => {
      hook.data = { text: 'Hi' };

      associateCurrentUser()(hook);

      expect(hook.data.userId).to.equal('1');
    });

    it('adds the user\'s ID to a an array of objects', () => {
      hook.data = [
        { text: 'Hi' },
        { text: 'Hello' }
      ];

      associateCurrentUser()(hook);

      expect(hook.data[0].userId).to.equal('1');
      expect(hook.data[1].userId).to.equal('1');
    });
  });
});