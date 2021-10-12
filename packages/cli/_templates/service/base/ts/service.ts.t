---
to: "<%= h.lib %>/services/<%= path %>.ts"
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

// Add this service to the service type index
declare module '<%= relative %>/declarations' {
  interface ServiceTypes {
    '<%= path %>': <%= className %>;
  }
}

// A configure function that registers the service via `app.configure`
export function <%= camelName %> (app: Application) {
  const options = {
    paginate: app.get('paginate'),
    app
  }

  app.use('<%= path %>', new <%= className %>(options));
}
