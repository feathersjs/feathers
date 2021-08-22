<img style="width: 100%; max-width: 400px;" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers logo">

## A framework for real-time applications and REST APIs with Deno

This folder contains the Deno build of Feathers.

## Use with Deno

```ts
// app.ts
import { feathers } from 'https://deno.land/x/feathers@v5.0.0-pre.3/mod.ts';

type Message {
  message: string;
}

class MyService {
  async create (data: Message) {
    return data;
  }
}

type ServiceTypes {
  myservice: MyService
}

const app = feathers<ServiceTypes>();

app.use('myservice', new MyService());

app.service('myservice').on('created', (data: Message) => {
  console.log('Created', data);
});

await app.service('myservice').create({
  message: 'Hello from Deno'
});
```
