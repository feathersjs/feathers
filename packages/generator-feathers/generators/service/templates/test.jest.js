const app = require('<%= relativeRoot %><%= libDirectory %>/app');

describe('\'<%= name %>\' service', () => {
  it('registered the service', () => {
    const service = app.service('<%= path %>');
    expect(service).toBeTruthy();
  });
});
