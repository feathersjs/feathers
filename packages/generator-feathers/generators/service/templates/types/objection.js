// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('<%= serviceModule %>');
const createModel = require('<%= relativeRoot %>models/<%= modelName %>');
const hooks = require('./<%= kebabName %>.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    model: Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/<%= path %>', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('<%= path %>');

  service.hooks(hooks);
};
