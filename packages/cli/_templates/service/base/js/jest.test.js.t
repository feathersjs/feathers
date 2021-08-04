---
to: "<%= h.feathers.tester === 'jest' ? `${h.test}/services/${path}.test.js` : null %>"
---
import { app } from '../<%= relative %>/<%= h.lib %>/app.js';

describe('\'<%= name %>\' service', () => {
  it('registered the service', () => {
    const service = app.service('<%= path %>');
    expect(service).toBeTruthy();
  });
});