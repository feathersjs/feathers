# feathers-authentication Example

This provides a complete working example of some of the basic usage of `feathers-authentication`.

1. Start the app by running `npm start`
2. Make a request using the authenticated user.

```bash
curl -H "Content-Type: application/json" -X POST -d '{"email":"admin@feathersjs.com","password":"admin"}' http://localhost:3030/authentication
```

For more details refer to the [`test/integration`](../test/integration) folder to see how you can authenticate with the server or refer to the [feathers-authentication-client](https://github.com/feathersjs/feathers-authentication-client).