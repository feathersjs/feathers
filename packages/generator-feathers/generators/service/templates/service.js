// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('<%= serviceModule %>');<% if(modelName) { %>
const createModel = require('../../models/<%= modelName %>');<% } %>
const hooks = require('./<%= kebabName %>.hooks');

module.exports = function (app) {
  <% if (modelName) { %>const Model = createModel(app);<% } %>
  const paginate = app.get('paginate');

  const options = {
    name: '<%= kebabName %>',<% if (modelName) { %>
    Model,<% } %>
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/<%= path %>', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('<%= path %>');

  service.hooks(hooks);

  app.publish(() => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // e.g. to publish all service events to all authenticated users use
    // return app.channel('authenticated');
  });
};
