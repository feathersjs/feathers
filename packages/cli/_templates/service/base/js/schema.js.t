---
to: "<%= h.lib %>/schema/<%= path %>.schema.js"
---
import { schema, resolve } from '@feathersjs/schema';

export const <%= camelName %>DataSchema = schema({
  $id: '<%= camelName %>Data',
  additionalPoperties: false,
  required: [ 'text' ],
  properties: {
    text: {
      type: 'string'
    }
  }
});

export const <%= camelName %>PartialSchema = <%= camelName %>DataSchema.extend({
  $id: '<%= camelName %>Partial',
  required: []
})

export const <%= camelName %>ResultSchema = <%= camelName %>DataSchema.extend({
  $id: '<%= camelName %>Data'
})

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
  properties: {}
});

export const <%= camelName %>DataResolver = resolve({
  properties: {}
});

export const <%= camelName %>ResultResolver = resolve({
  properties: {}
});
