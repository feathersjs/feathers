---
to: "<%= h.lib %>/schema/<%= path %>.schema.js"
---
import { schema, resolve } from '@feathersjs/schema';

export const <%= camelName %>DataSchema = schema({
  $id: '<%= camelName %>Data',
  type: 'object',
  additionalProperties: false,
  required: [ 'text' ],
  properties: {
    text: {
      type: 'string'
    }
  }
});

export const <%= camelName %>ResultSchema = <%= camelName %>DataSchema.extend({
  $id: '<%= camelName %>Result'
})

export const <%= camelName %>QuerySchema = schema({
  $id: '<%= camelName %>Query',
  type: 'object',
  additionalProperties: false,
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
  schema: <%= camelName %>QuerySchema,
  validate: 'before',
  properties: {}
});

export const <%= camelName %>DataResolver = resolve({
  schema: <%= camelName %>DataSchema,
  validate: 'before',
  properties: {}
});

export const <%= camelName %>ResultResolver = resolve({
  schema: <%= camelName %>ResultSchema,
  validate: false,
  properties: {}
});
