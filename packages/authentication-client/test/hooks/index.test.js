import { expect } from 'chai';
import hooks from '../../src/hooks';

describe('hooks', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../../lib/hooks')).to.equal('object');
  });

  it('is ES6 compatible', () => {
    expect(typeof hooks).to.equal('object');
  });

  it('exposes populateEntity hook', () => {
    expect(typeof hooks.populateEntity).to.equal('function');
  });

  it('exposes populateHeader hook', () => {
    expect(typeof hooks.populateHeader).to.equal('function');
  });

  it('exposes populateAccessToken hook', () => {
    expect(typeof hooks.populateAccessToken).to.equal('function');
  });
});
