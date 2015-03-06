import assert from 'assert';
import commons from '../src/commons';

describe('commons main tests', () => {
  it('stripSlashes', () => {
    assert.equal(commons.stripSlashes('some/thing'), 'some/thing');
    assert.equal(commons.stripSlashes('/some/thing'), 'some/thing');
    assert.equal(commons.stripSlashes('some/thing/'), 'some/thing');
    assert.equal(commons.stripSlashes('/some/thing/'), 'some/thing');
    assert.equal(commons.stripSlashes('//some/thing/'), 'some/thing');
    assert.equal(commons.stripSlashes('//some//thing////'), 'some//thing');
  });
});
