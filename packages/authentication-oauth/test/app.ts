import feathers from '@feathersjs/feathers';
import express, { rest } from '@feathersjs/express';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { express as oauth } from '../src';

// @ts-ignore
import memory from 'feathers-memory';

const port = 3000;
const app = express(feathers());
const auth = new AuthenticationService(app);

auth.register('jwt', new JWTStrategy());

app.configure(rest());
app.set('host', '127.0.0.1');
app.set('port', port);
app.set('authentication', {
  secret: 'supersecret',
  entity: 'user',
  service: 'users',
  httpStrategies: [ 'jwt' ],
  oauth: {
    // redirect: '/',
    
  }
});

app.use('/authentication', auth);
app.use('/users', memory());

app.configure(oauth());

app.listen(port);
