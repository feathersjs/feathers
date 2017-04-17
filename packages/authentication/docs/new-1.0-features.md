# New 1.0 Features

## New Config Options

- `entity` - the global key name to assign data returned from a strategy to. Defaults to `user`. Which becomes `req.user` in middleware, `hook.params.user` in hooks and `socket.user` for websockets.

You can override this property for each passport authentication strategy like so:

```js
// when calling from hooks
auth.hooks.authenticate('local', { assignProperty: 'custom' })
// when calling from middleware
auth.express.authenticate('local', { assignProperty: 'custom' })
// For sockets and all other methods you can have it in your main
// config or pass explicitly when initializing auth.
app.configure(authentication({
    local: {
        assignProperty: 'custom'
    }
}))
```

## More warnings and debugging

We've added more helpful warning messages and added debug logs for every hook, service, and middleware. We use the [debug]() module so usage is the same.

#### Turning on all auth logs
You can turn on all auth debug logs by running your app with `DEBUG=feathers-authentication* npm start`.

#### Turning on logs for a specific type
If you want to only turn on logs for a `hooks`, `express`, `passport` or `service` you can do `DEBUG=feathers-authentication:<type>* npm start`. For example,

```
`DEBUG=feathers-authentication:hooks* npm start`
```

#### Turning on logs for a specific entity
If you want to only turn on logs for a specific hook, middleware or service you can do `DEBUG=feathers-authentication:<type>:<entity> npm start`. For example,

```
`DEBUG=feathers-authentication:hooks:authenticate npm start`
```

## More Flexible Tokens

Previously JWT's were only used as an access token and could only be created as part of the authentication flow. This is still the default, however it's now possible to create JWTs with different options for all sorts of things like password reset, email verification, magic links, etc.

On the server side all you need to do is call `app.createJWT(payload, [options])`. By default it will pull from your global auth config but you can pass custom options in order to customize the JWT behaviour.

Here is an example of how you might generate a temporary password reset JWT:

```js
const payload = {
    id: user.id
    // whatever else you want to put in the token
};

const options = {
    jwt: {
        audience: 'user',
        subject: 'password-reset',
        expiresIn: '5m'
    }
};

app.passport.createJWT(payload, options).then(token => {
    // Do your thing
})
.catch(error => {
    // Handle errors
});
```

You can also verify a JWT at any point in your app. You are no longer restricted to using a hook:

```js
const options = {
    jwt: {
        audience: 'user',
        subject: 'password-reset',
        expiresIn: '5m'
    }
};

app.passport.verifyJWT(payload, options).then(payload => {
    // Do your thing
})
.catch(error => {
    // Handle errors
});
```

## Server Side Rendering

You can now create "Universal" apps or the more old school server side templated apps **with** stateless JWT authentication. In order to support server side rendering the client will now automatically attempt to authenticate if a token is present without you needing to call `app.authenticate` explicitly each time.

For servers that are using a template engine to render their views server side (ie. Jade, Handlebars, etc) you may not be using client side JS for your authentication. So we now support using your JWT more like a traditional session. It's still stateless but the JWT access token is stored in a cookie that by default expires at the same time as the JWT access token.

## Logged In/Logged Out State
It wasn't possible to know accurately when a user was logged in or out on the server side. We've fixed that!

You can now access the user at any point in your application . In addition, **you no longer need to add the `verifyToken` and `populateUser` hooks to your services** because your entity is already loaded earlier on in the data flow.

Whenever you successfully authenticate with an authentication strategy the data that gets returned from the authentication strategy is now accessible throughout your entire app.

### Using Sockets

Using sockets you can now listen for the server side `login` and `logout` events across your entire back-end. This is accomplished by doing:

```js
app.on('login', function(entity, info) {
  console.log('User logged in', entity);
});

app.on('logout', function(tokenPayload, info) {
  console.log('User logged out', tokenPayload);
});

// or on a specific socket

socket.on('login', function(entity, info) {
  console.log('User logged in', entity);
});

socket.on('logout', function(tokenPayload, info) {
  console.log('User logged out', tokenPayload);
});

```

### In Express Middleware
If you need this information in a custom route or other middleware you can access the currently authenticated entity (ie. user) and whether the request is authenticated by inspecting `req.<entity>` (ie. `req.user`) and `req.authenticated`.

### In Hooks/Services
If you need this information in a hook or service you can access the current currently authenticated entity (ie. user) and whether they are authenticated by inspecting `hook.params.<entity>` (ie. `hook.params.user`) and `hooks.params.authenticated` respectively.
