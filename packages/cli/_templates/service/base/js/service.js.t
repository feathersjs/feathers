---
to: "<%= h.lib %>/services/<%= path %>.js"
---
import { hooks } from '@feathersjs/hooks';
import { resolveData, resolveQuery, resolveResult } from '@feathersjs/schema';

import {
  <%= camelName %>QueryResolver,
  <%= camelName %>DataResolver,
  <%= camelName %>ResultResolver
} from '<%= relative %>/schema/<%= path %>.schema.js'

// The <%= className %> service class

// Register hooks that run on all service methods
hooks(<%= className %>.prototype, [
  resolveQuery(<%= camelName %>QueryResolver),
  resolveResult(<%= camelName %>ResultResolver)
]);

// Register service method specific hooks
hooks(<%= className %>, {
  find: [
  ],
  get: [
  ],
  create: [
    resolveData(<%= camelName %>DataResolver)
  ],
  update: [
    resolveData(<%= camelName %>DataResolver)
  ],
  patch: [
    resolveData(<%= camelName %>DataResolver)
  ],
  remove: [
  ]
});

export { <%= className %> };

// A configure function that registers the service via `app.configure`
export function <%= camelName %> (app) {
  const options = {
    paginate: app.get('paginate'),
    app
  }

  app.use('<%= path %>', new <%= className %>(options));
}
