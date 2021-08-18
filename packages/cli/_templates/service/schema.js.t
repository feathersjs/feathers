---
to: "<%= schema ? `${h.lib}/schema/${path}` : null %>"
---
import { schema, resolve } from '@feathersjs/schema';

export const <%= camelName %>Schema = schema({
  $id: '<%= camelName %>',
  additionalPoperties: false,
  properties: {
    text: {
      type: 'string'
    }
  }
});

export const <%= camelName %>QuerySchema = schema({
  $id: '<%= camelName %>Query',
  additionalPoperties: false,
  properties: {
    $limit: {
      type: 'integer',
      minimum: 0,
      maximum: 100
    },
    $skip: {
      type: 'integer',
      minimum: 0
    }
  }
});

export const <%= camelName %>QueryResolver = resolve({
});

export const <%= camelName %>DataResolver = resolve({
});

export const <%= camelName %>ResultResolver = resolve({
});
