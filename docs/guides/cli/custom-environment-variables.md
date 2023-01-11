# Custom Environment Variables

While `node-config` used for [application configuration](./default.json.md) recommends to pass environment based configuration as a JSON string in a single `NODE_CONFIG` environment variable, it is also possible to use other environment variables via the `config/custom-environment-variables.json` file which looks like this by default:

```json
{
  "port": {
    "__name": "PORT",
    "__format": "number"
  },
  "host": "HOSTNAME"
}
```

This sets `app.get('port')` using the `PORT` environment variable (if it is available) parsing it as a number and `app.get('host')` from the `HOSTNAME` environment variable.

<BlockQuote type="tip">

See the [node-config custom envrionment variable](https://github.com/node-config/node-config/wiki/Environment-Variables#custom-environment-variables) documentation for more information.

</BlockQuote>

## Dotenv

To add support for [dotenv](https://www.dotenv.org/) `.env` files run

```
npm install dotenv --save
```

And update `src/app.ts` as follows:

```ts
// dotenv replaces all environmental variables from ~/.env in ~/config/custom-environment-variables.json
import * as dotenv from 'dotenv'
dotenv.config()

import configuration from '@feathersjs/configuration'
```

<BlockQuote type="warning" label="important">

`dotenv.config()` needs to run _before_ `import configuration from '@feathersjs/configuration'`

</BlockQuote>
