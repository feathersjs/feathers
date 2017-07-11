import { expect } from 'chai';
import { ObjectID } from 'mongodb';
import updateEntity from '../../src/socket/update-entity';

const TEST_OBJECT_ID = '59499c9a901604391cab65f5';

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

    updateEntity(app)(user);

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

    updateEntity(app)(user);

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

    updateEntity(app)(user);

    expect(app.primus.connections['my-socket'].request.feathers.user.email).to.equal('test@feathersjs.com');
  });

  it('gracefully handles unauthenticated connections', function () {
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
            'unauthenticated': {
              request: {},
              feathers: {}
            },
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

    updateEntity(app)(user);

    expect(app.io.sockets.sockets['my-socket'].feathers.user.email).to.equal('test@feathersjs.com');
  });

  it('updates the passed-in entity when the idField is an ObjectID', function () {
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
                user: { _id: new ObjectID(TEST_OBJECT_ID), email: 'admin@feathersjs.com' }
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
    const user = { _id: new ObjectID(TEST_OBJECT_ID), email: 'test@feathersjs.com' };

    updateEntity(app)(user);

    expect(app.io.sockets.sockets['my-socket'].feathers.user.email).to.equal('test@feathersjs.com');
  });

  it('socket entity should "deep equal" passed-in entity', function () {
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
                user: {
                  _id: 5,
                  email: 'admin@feathersjs.com',
                  nested: { value: 1 },
                  optional: true
                }
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
    const user = { _id: 5, email: 'test@feathersjs.com', nested: { value: 3 } };

    updateEntity(app)(user);

    expect(app.io.sockets.sockets['my-socket'].feathers.user).to.deep.equal(user);
  });
});
