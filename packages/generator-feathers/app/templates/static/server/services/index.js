// jshint unused:false
import userService from './user';

export default function() {
  const app = this;

  app.configure(userService);
}
