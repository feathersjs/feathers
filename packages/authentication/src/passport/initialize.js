import makeDebug from 'debug';
import { createJWT, verifyJWT } from '../utils';

const debug = makeDebug('feathers-authentication:passport:initialize');

export default function initialize (options = {}) {
  // const app = this;

  debug('Initializing custom passport initialize', options);

  // Do any special feathers passport initialization here. We may need this
  // to support different engines.
  return function (passport) {
    // NOTE (EK): This is called by passport.initialize() when calling
    // app.configure(authentication()).
    
    // Expose our JWT util functions globally
    passport.createJWT = createJWT;
    passport.verifyJWT = verifyJWT;
  };
}