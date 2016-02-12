export let getCookie = function(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }

  return null;
};

export let getUser = function() {
  // TODO (EK): Maybe make this configurable
  const key = 'feathers-user';
  let user = localStorage.getItem(key);

  return JSON.parse(user);
};

export let setToken = function(token) {
  // TODO (EK): Maybe make this configurable
  const key = 'feathers-jwt';
  localStorage.setItem(key, token);

  // TODO (EK): Support async storage for react native  

  return true;
};

export let setUser = function(user) {
  // TODO (EK): Maybe make this configurable
  const key = 'feathers-user';
  localStorage.setItem(key, JSON.stringify(user));

  // TODO (EK): Support async storage for react native  

  return true;
};

export let getToken = function() {
  // TODO (EK): Maybe make this configurable
  const key = 'feathers-jwt';
  let token = localStorage.getItem(key);

  if (token) {
    return token;
  }

  // TODO (EK): Support async storage for react native  

  // We don't have the token so try and fetch it from the cookie
  // and store it in local storage.
  // TODO (EK): Maybe we should clear the cookie
  token = getCookie(key);

  if (token) {
    localStorage.setItem(key, token);
  }

  return token;
};

export let clearToken = function() {
  // TODO (EK): Maybe make this configurable
  const key = 'feathers-jwt';

  // TODO (EK): Support async storage for react native
  localStorage.removeItem(key);

  return true;
};

export let clearUser = function() {
  // TODO (EK): Maybe make this configurable
  const key = 'feathers-user';

  // TODO (EK): Support async storage for react native
  localStorage.removeItem(key);

  return true;
};

export default {
  getUser,
  setUser,
  clearUser,
  getToken,
  setToken,
  clearToken,
  getCookie
};