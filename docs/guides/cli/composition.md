# Composition

Feathers does not use a complex dependency injection mechanism.

## Configure functions

The most important pattern used in the generated application to split things up into individual files are _configure functions_ which are functions that are exported from a file and take the Feathers [app object](../../api/application.md) and then use it to e.g. register services. Those functions are then passed to [app.configure](../../api/application.md#configurecallback).

For example, have a look at the following files:

<Tabs>

<Tab name="For TypeScript Apps" global-id="ts">

<div class="pb-2" />

`src/services/index.ts` looks like this:

```ts
import { Application } from '../declarations';
import users from './users/users.service';

export default function (app: Application) {
  app.configure(users);
}
```

It uses another configure function exported from `src/services/users/users.service.ts`. The export from `src/services/index.js` is in turn used in `src/app.ts` as:

```ts
// ...
import services from './services';

// ...
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// ...
```

</Tab>

<Tab name="For JavaScript Apps" global-id="js">

<div class="pb-2" />

`src/services/index.js` looks like this:

```js
const users = require('./users/users.service.js');

module.exports = function (app) {
  app.configure(users);
};
```

It uses another configure function exported from `src/services/users/users.service.js`. The export from `src/services/index.js` is in turn used in `src/app.js` as:

```js
// ...
const services = require('./services');

// ...
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// ...
```

</Tab>

</Tabs>

This is how the generator splits things up into separate files and any documentation example that uses the `app` object can be used in a configure function. You can create your own files that export a configure function and `require`/`import` and `app.configure` them in `app.js`.

> __Note:__ Keep in mind that the order in which configure functions are called might matter, e.g. if it is using a service, that service has to be registered first.

## Environments

