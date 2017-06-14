import assert from 'assert';

import feathers from '../src';

describe.skip('Service events', () => {
  describe('emits events on a service', () => {
    it('.create and created', () => {
      const app = feathers().use('/creator', {
        create (data) {
          return Promise.resolve(data);
        }
      });

      const service = app.service('creator');

      service.on('created', data => {
        assert.ok(data);
        console.log('!!!', data);
      });

      service.create({ message: 'Hello' });
    });
  });
});
