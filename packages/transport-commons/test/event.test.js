import assert from 'assert';
import feathers from 'feathers';
import socketio from 'feathers-socketio';
import { filterMixin } from '../src/events';

const fn1 = function () {};
const fn2 = function () {};

describe('events', () => {
  const app = feathers();
  app.configure(socketio());

  it('service.filters are automatically bootstrapped', () => {
    const schema = { find () {} };
    const service = app.service('service', schema);
    service.filters = { all: [fn1, fn2] };
    service.filter = null; // filterMixin won't run if set
    filterMixin(service);

    app.use('/service', service);

    assert(service._eventFilters.all.length === 2);
    assert(typeof service._eventFilters.all[0] === 'function');
    assert(typeof service._eventFilters.all[1] === 'function');
  });
});
