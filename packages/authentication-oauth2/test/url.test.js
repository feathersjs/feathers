import { expect } from 'chai';
import url from '../src/url';

let mockApp;

describe('utils:url', function() {
  beforeEach(() => {
    mockApp = {
      env: 'development',
      get: function(value) {
        switch(value) {
          case 'port':
            return 3030;
          case 'host':
            return 'feathersjs.com';
          case 'env':
            return this.env;
        }
      }
    };
  });

  describe('when in development mode', () => {
    it('returns the correct url', () => {
      const uri = url(mockApp, 'test');
      expect(uri).to.equal('http://feathersjs.com:3030/test');
    });
  });

  describe('when in test mode', () => {
    it('returns the correct url', () => {
      mockApp.env = 'test';
      const uri = url(mockApp, 'test');
      expect(uri).to.equal('http://feathersjs.com:3030/test');
    });
  });

  describe('when in production mode', () => {
    it('returns the correct url', () => {
      mockApp.env = 'production';
      const uri = url(mockApp, 'test');
      expect(uri).to.equal('https://feathersjs.com/test');
    });
  });

  describe('when path is not provided', () => {
    it('returns the correct url', () => {
      const uri = url(mockApp);
      expect(uri).to.equal('http://feathersjs.com:3030/');
    });
  });
});