import assert from 'assert';
import { hello } from '../src';

describe('@feathersjs/schema', () => {
  it('initializes', async () => {
    assert.strictEqual(hello(), 'Hello');

    const app = feathers();


    app.use('/messages', memory(), {
      schema: {
        query: {},
        data: {},
        result: {},
        methods: {
          create: {
            data: {},
            result: {}
          }
        }
      }
    })
  });
});
