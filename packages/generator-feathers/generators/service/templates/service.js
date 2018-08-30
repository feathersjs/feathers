// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('<%= serviceModule %>');<% if(modelName) { %>
const createModel = require('<%= relativeRoot %>models/<%= modelName %>');<% } %>
const hooks = require('./<%= kebabName %>.hooks');

module.exports = function (app) {
  <% if (modelName) { %>const Model = createModel(app);<% } %>
  const paginate = app.get('paginate');

  const options = {<% if (modelName) { %>
    Model,<% } %>
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/<%= path %>', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('<%= path %>');

  service.hooks(hooks);
};
