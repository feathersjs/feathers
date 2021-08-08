---
to: "<%= schema ? `${h.lib}/schema/${path}` : null %>"
---
import { schema, resolve } from '@feathersjs/schema';

export const <%= className %>Schema = schema({
  $id: '<%= className %>',
  properties: {
    text: {
      type: 'string'
    }
  }
});

export const <%= className %>QuerySchema = schema({
  $id: '<%= className %>Query',
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

export const <%= className %>QueryResolver = resolve({
  userId: async (value, context) => {
    const { user } = context.params;

    if (!user.isAdmin){
      return user.id;
    }

    return value;
  }
});

export const <%= className %>DataResolver = resolve({
});

export const <%= className %>ResultResolver = resolve({
});
