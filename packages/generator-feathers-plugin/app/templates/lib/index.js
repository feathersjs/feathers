/*
 * <%= _.slugify(appname) %>
 *
 * Copyright (c) <%= currentYear %> <%= realname %>
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(config) {
  return function() {
    var app = this;
    var services = {};

    app.enable('feathers <%= pluginName %>');

  };
};