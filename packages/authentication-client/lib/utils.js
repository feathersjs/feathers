exports.Storage = class Storage {
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
};

exports.payloadIsValid = function payloadIsValid (payload) {
  return payload && (!payload.exp || payload.exp * 1000 > new Date().getTime());
};

exports.getCookie = function getCookie (name) {
  if (typeof document !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
  }

  return null;
};

exports.clearCookie = function clearCookie (name) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }

  return null;
};
