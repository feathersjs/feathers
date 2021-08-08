---
to: "<%= h.lib %>/services/<%= path %>.js"
---
import { hooks } from '@feathersjs/hooks';

// The <%= className %> service class

// Register hooks that run on all service methods
hooks(<%= className %>.prototype, [
]);

// Register service method specific hooks
hooks(<%= className %>, {
  find: [
  ],
  get: [
  ],
  create: [
  ],
  update: [
  ],
  patch: [
  ],
  remove: [
  ]
});

export { <%= className %> };

// A configure function that registers the service via `app.configure`
export function <%= configureFunction %> (app) {
  const options = {
    paginate: app.get('paginate')
  }

  app.use('/<%= path %>', new <%= className %>(options));
}
