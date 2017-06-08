import { expect } from 'chai';
import updateEntity from '../../src/socket/update-entity';

describe('Socket "Update Entity" Handler', function () {
  it('updates the passed-in entity for socket.io', function () {
    const app = {
      get () {
        return {
          entity: 'user',
          service: 'users'
        };
      },
      io: {
        sockets: {
          sockets: {
            'my-socket': {
              feathers: {
                user: { _id: 5, email: 'admin@feathersjs.com' }
              }
            }
          }
        }
      },
      services: {
        users: {
          id: '_id'
        }
      },
      service (location) {
        return this.services[location];
      }
    };
    const user = { _id: 5, email: 'test@feathersjs.com' };

    updateEntity(user, { app });

    expect(app.io.sockets.sockets['my-socket'].feathers.user.email).to.equal('test@feathersjs.com');
  });

  it('updates the passed-in entity for primus', function () {
    const app = {
      get () {
        return {
          entity: 'user',
          service: 'users'
        };
      },
      primus: {
        connections: {
          'my-socket': {
            request: {
              feathers: {
                user: { _id: 5, email: 'admin@feathersjs.com' }
              }
            }
          }
        }
      },
      services: {
        users: {
          id: '_id'
        }
      },
      service (location) {
        return this.services[location];
      }
    };
    const user = { _id: 5, email: 'test@feathersjs.com' };

    updateEntity(user, { app });

    expect(app.primus.connections['my-socket'].request.feathers.user.email).to.equal('test@feathersjs.com');
  });

  it('sets idField to id if entity.id exists and the service has no `id` property', function () {
    const app = {
      get () {
        return {
          entity: 'user',
          service: 'users'
        };
      },
      primus: {
        connections: {
          'my-socket': {
            request: {
              feathers: {
                user: { id: 5, email: 'admin@feathersjs.com' }
              }
            }
          }
        }
      },
      services: {
        users: { }
      },
      service (location) {
        return this.services[location];
      }
    };
    const user = { id: 5, email: 'test@feathersjs.com' };

    updateEntity(user, { app });

    expect(app.primus.connections['my-socket'].request.feathers.user.email).to.equal('test@feathersjs.com');
  });
});
