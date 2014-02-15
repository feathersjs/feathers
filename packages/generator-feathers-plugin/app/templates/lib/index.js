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

        // Enable the <%= pluginName %> Plugin
        app.enable('feathers <%= pluginName %>');

        // Check for configuration
        if (config) {
            // Apply configuration
        }

        // Optional: Register this plugin as a Feathers provider
        app.providers.push(function(path, service) {
            services[path] = service;
        });

    };
};
