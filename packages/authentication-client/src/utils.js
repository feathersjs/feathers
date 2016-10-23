import decode from 'jwt-decode';

// Returns a promise that resolves when the socket is connected
export function connected (app) {
  return new Promise((resolve, reject) => {
    if (app.rest) {
      return resolve();
    }

    const socket = app.io || app.primus;

    if (!socket) {
      return reject(new Error(`It looks like no client connection has been configured.`));
    }

    // If one of those events happens before `connect` the promise will be rejected
    // If it happens after, it will do nothing (since Promises can only resolve once)
    socket.once('disconnect', reject);
    socket.once('close', reject);

    // If the socket is not connected yet we have to wait for the `connect` event
    if ((app.io && !socket.connected) || (app.primus && socket.readyState !== 3)) {
      const connectEvent = app.primus ? 'open' : 'connect';
      socket.once(connectEvent, () => resolve(socket));
    } else {
      resolve(socket);
    }
  });
}

// Returns a promise that authenticates a socket
export function authenticateSocket (options, socket, method) {
  return new Promise((resolve, reject) => {
    socket.once('unauthorized', reject);
    socket.once('authenticated', resolve);

    socket[method]('authenticate', options);
  });
}

// Returns a promise that de-authenticates a socket
export function logoutSocket (socket, method) {
  return new Promise((resolve, reject) => {
    socket[method]('logout', error => {
      if (error) {
        reject(error);
      }

      resolve();
    });
  });
}

// Returns the value for a cookie
export function getCookie (name) {
  if (typeof document !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
  }

  return null;
}

// Returns the value for a cookie
export function clearCookie (name) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }

  return null;
}

// Pass a jwt token, get back a payload if it's valid.
export function verifyJWT (data) {
  return new Promise((resolve, reject) => {
    const token = typeof data === 'string' ? data : data.token;
    if (token) {
      try {
        let payload = decode(token);
        if (payloadIsValid(payload)) {
          resolve(payload);
        } else {
          reject(new Error('Invalid token: expired'));
        }
      } catch (error) {
        reject(new Error('Cannot decode malformed token.'));
      }
    } else {
      reject(new Error('No token provided to verifyJWT'));
    }
  });
}

// Pass a decoded payload and it will return a boolean based on if it hasn't expired.
export function payloadIsValid (payload) {
  return payload && payload.exp * 1000 > new Date().getTime();
}

// Tries the JWT from the given key either from a storage or the cookie.
export function retrieveJWT (tokenKey, cookieKey, storage) {
  return Promise.resolve(storage.getItem(tokenKey)).then(jwt => {
    let token = jwt || getCookie(cookieKey);
    if (token && token !== 'null' && !payloadIsValid(decode(token))) {
      token = undefined;
    }
    return token;
  });
}

// Returns a storage implementation
export function getStorage (storage) {
  if (storage) {
    return storage;
  }

  return {
    store: {},
    getItem (key) {
      return this.store[key];
    },

    setItem (key, value) {
      return (this.store[key] = value);
    },

    removeItem (key) {
      delete this.store[key];
      return this;
    }
  };
}
