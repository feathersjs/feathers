# feathers-authentication-jwt Example

This provides a complete working example on how to use `feathers-authentication-jwt` to provide JWT authentication and get a JWT access token upon successful authentication or to enforce authentication of a service or endpoint.

1. Start the app by running `npm start`
2. Make a request using the JWT access token outputted in the console.

**Getting a new access token**
```bash
curl -H "Authorization: <your access token>" -X POST http://localhost:3030/authentication
```

**Hitting a protected resource**
```bash
curl -H "Authorization: <your access token>" http://localhost:3030/users
```