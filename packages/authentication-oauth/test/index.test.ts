import { strict as assert } from 'assert';
import feathers from '@feathersjs/feathers';
import { setup, express } from '../src';
import { AuthenticationService } from '@feathersjs/authentication/lib';

describe('@feathersjs/authentication-oauth', () => {
  describe('setup', () => {
    it('errors when service does not exist', () => {
      const app = feathers();
      
      try {
        app.configure(setup({ authService: 'something' }));
        assert.fail('Should never get here');
      } catch (error) {
        assert.equal(error.message,
          `'something' authentication service must exist before registering @feathersjs/authentication-oauth`
        );
      }
    });

    it('errors when service does not exist', () => {
      const app = feathers();

      app.use('/authentication', new AuthenticationService(app));
      
      app.configure(express());
    });
  });
});
