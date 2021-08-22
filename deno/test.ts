import { assertEquals } from 'https://deno.land/std@0.91.0/testing/asserts.ts';
import { feathers } from './mod.ts';

class MyService {
  async create (data: any) {
    return data;
  }
}

Deno.test('instantiates a Feathers app with a service', async () => {
  const app = feathers();
  const data = {
    message: 'hi'
  };

  app.use('test', new MyService());

  const eventPromise = new Promise(resolve => {
    app.service('test').once('created', (data: any) => resolve(data));
  });
  
  assertEquals(await app.service('test').create(data), data);
  assertEquals(await eventPromise, data);
});
