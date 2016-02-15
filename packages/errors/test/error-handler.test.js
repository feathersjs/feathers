import assert from 'assert';
import { handler, errors } from '../src';

describe('feathers-errors', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib').handler, 'function');
  });

  it('is import compatible', () => {
    assert.equal(typeof handler, 'function');
  });

  describe('converts an non-feathers error', () => {
    it.skip('is an instance of GeneralError', () => {
      let error = new Error();

      assert.equal(error instanceof errors.GeneralError, true);
    });

    it.skip('still has a stack trace', () => {
      assert.equal(handler, 'function');  
    });
    
    it.skip('converts error code strings to integers', () => {
      assert.equal(handler, 'function');  
    });
  });

  describe('converts error codes', () => {
    it.skip('converts string to integer', () => {
      assert.equal(handler, 'function');  
    });

    it.skip('converts NaN to 500', () => {
      assert.equal(handler, 'function');  
    });
  });

  describe('text/html format', () => {
    describe('when public directory exists', () => {
      it.skip('serves a 404.html', () => {
        assert.equal(handler, 'function');  
      });

      it.skip('serves a 500.html', () => {
        assert.equal(handler, 'function');  
      });
    });
    
    describe('when public directory does not exist', () => {
      it.skip('returns the error object as text', () => {
        assert.equal(handler, 'function');  
      });  
    });
  });

  describe('application/json format', () => {
    it.skip('returns an error as JSON', () => {
      assert.equal(handler, 'function');  
    });

    describe('when in production', () => {
      it.skip('removes the stack trace', () => {
        let error = {};
        assert.equal(error.stack, undefined);  
      });
    });
  });
});
