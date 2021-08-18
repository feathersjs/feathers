---
to: "<%= h.test %>/services/<%= path %>.test.ts"
---
import assert from 'assert';
import { app } from '../<%= relative %>/<%= h.lib %>/app';

describe('\'<%= name %>\' service', () => {
  it('registered the service', () => {
    const service = app.service('<%= path %>');

    assert.ok(service, 'Registered the service');
  });
});