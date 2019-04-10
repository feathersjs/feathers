import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import { AuthenticationService } from '@feathersjs/authentication';
import { express as oauth } from '../src';

const port = 3000;
const app = express(feathers());
const auth = new AuthenticationService(app);

app.set('host', '127.0.0.1');
app.set('port', port);
app.set('authentication', {
  secret: 'supersecret',
  entity: null,
  strategies: [ 'twitter' ],
  oauth: {
    defaults: {
      successRedirect: 'http://frontend.com#{query}',
      failureRedirect: 'http://frontend.com#{query}'
    },
    twitter: {
      
    }
  }
});

app.use('/authentication', auth);
app.configure(oauth());

app.listen(port);
