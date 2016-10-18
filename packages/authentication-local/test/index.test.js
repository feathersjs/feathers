import { expect } from 'chai';
import plugin from '../src';

describe('feathers-authentication-local', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib')).to.equal('function');
  });

  it('basic functionality', () => {
    expect(typeof plugin).to.equal('function', 'It worked');
    expect(plugin()).to.equal('feathers-authentication-local');
  });
});
