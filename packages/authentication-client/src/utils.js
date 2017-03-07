export class Storage {
  constructor () {
    this.store = {};
  }

  getItem (key) {
    return this.store[key];
  }

  setItem (key, value) {
    return (this.store[key] = value);
  }

  removeItem (key) {
    delete this.store[key];
    return this;
  }
}

// Pass a decoded payload and it will return a boolean based on if it hasn't expired.
export function payloadIsValid (payload) {
  return payload && payload.exp * 1000 > new Date().getTime();
}

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

export function clearCookie (name) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }

  return null;
}
