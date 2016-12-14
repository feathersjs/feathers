import initialize from '../../src/passport/initialize';
import { expect } from 'chai';

describe('passport:initialize', () => {
  it('it returns a function', () => {
    expect(typeof initialize()).to.equal('function');
  });
});
