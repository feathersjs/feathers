# Authentication

## Custom Authentication Hook

You can write a simple custom hook that authenticates requests. The following example checks for an API key in the `Authorization` header and adds the user information to the service call `params`:

```ts
import type { HookContext, NextFunction } from 'feathers'
import { NotAuthenticated } from 'feathers/errors'

const API_KEYS: Record<string, { email: string }> = {
  'my-secret-api-key': { email: 'admin@example.com' }
}

export async function authenticateApiKey(context: HookContext, next: NextFunction) {
  const apiKey = context.params.headers?.authorization

  if (!apiKey || !API_KEYS[apiKey]) {
    throw new NotAuthenticated('Invalid API key')
  }

  context.params.user = API_KEYS[apiKey]

  await next()
}

app.service('messages').hooks({
  around: {
    all: [authenticateApiKey]
  }
})
```

## Talon Auth

The recommended authentication mechanism for Feathers v6 is [Talon Auth](https://talon.codes), a passwordless authentication service using email-based login codes and OAuth providers. It provides a drop-in `<talon-login>` web component for the frontend and a token verifier for the backend that works offline with no external requests.

Install Talon Auth via:

```
npm install talon-auth
```

The following hook verifies a Talon access token from the `Authorization` header and adds the authenticated user to `params`:

```ts
import type { HookContext, NextFunction } from 'feathers'
import { NotAuthenticated } from 'feathers/errors'
import { createVerifier } from 'talon-auth'

const verifier = createVerifier({ appId: '<your-app-id>' })

export async function authenticate(context: HookContext, next: NextFunction) {
  const authorization = context.params.headers?.authorization

  if (!authorization) {
    throw new NotAuthenticated('Not authenticated')
  }

  const { user } = await verifier.verifyHeader(authorization)

  context.params.user = user

  await next()
}

app.service('messages').hooks({
  around: {
    all: [authenticate]
  }
})
```

You can get your `appId` by creating an application in the [Talon Dashboard](https://talon.codes/dashboard). For frontend integration, see the [Talon Auth documentation](https://talon.codes).
