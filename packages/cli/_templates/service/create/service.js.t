---
to: <%= h.lib %>/services/<%= path %>.js
sh: <%= h.generate('custom', 'service', '--name', name, '--path', path, '--className', className) %>
---
import { hooks } from '@feathersjs/hooks';

hooks(<%= className %>.prototype, [
  authenticate('jwt')
]);

hooks(<%= className %>, {
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
});

export function <%= configureFunction %> (app) {
  const options = {
    paginate: app.get('paginate')
  }

  app.use('/<%= path %>', new <%= className %>(options));
}
