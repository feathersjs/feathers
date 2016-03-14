// Returns a promise that resolves when the socket is connected
export function connected(app) {
  return new Promise((resolve, reject) => {
    if(app.rest) {
      return resolve();
    }

    const socket = app.io || app.primus;

    if(!socket) {
      return reject(new Error(`It looks like no client connection has been configured.`));
    }

    // If one of those events happens before `connect` the promise will be rejected
    // If it happens after, it will do nothing (since Promises can only resolve once)
    socket.once('disconnect', reject);
    socket.once('close', reject);

    // If the socket is not connected yet we have to wait for the `connect` event
    if( (app.io && !socket.connected) || (app.primus && socket.readyState !== 3)) {
      socket.once('connect', () => resolve(socket));
    } else {
      resolve(socket);
    }
  });
}

// Returns a promise that authenticates a socket
export function authenticateSocket(options, socket, method) {
  return new Promise((resolve, reject) => {
    socket.once('unauthorized', reject);
    socket.once('authenticated', resolve);

    socket[method]('authenticate', options);
  });
}

// Returns the value for a cookie
export function getCookie(name) {
  if(typeof document !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if(parts.length === 2) {
      return parts.pop().split(';').shift();
    }
  }

  return null;
}

// Tries the JWT from the given key either from a storage or the cookie
export function getJWT(key, storage) {
  return Promise.resolve(storage.getItem(key)).then(jwt => {
    const cookieKey = getCookie(key);

    if(cookieKey) {
      return cookieKey;
    }

    return jwt;
  });
}

// Returns a storage implementation
export function getStorage(storage) {
  if(storage) {
    return storage;
  }

  return {
    store: {},
    getItem(key) {
      return this.store[key];
    },

    setItem(key, value) {
      return (this.store[key] = value);
    }
  };
}
