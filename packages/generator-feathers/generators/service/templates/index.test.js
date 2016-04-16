'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('<%= name %> service', function() {
  it('registered the <%= pluralizedName %> service', () => {
    assert.ok(app.service('<%= pluralizedName %>'));
  });
});
