const defaults = {
  header: 'Authorization',
  scheme: 'Bearer',
  storageKey: 'feathers-jwt',
  jwtStrategy: 'jwt',
  path: '/authentication',
  entity: 'user',
  service: 'users'
};

module.exports = app => {
  app.hooks({
    before: [ ]
  });
};
