// A Mock Passport Strategy for testing.

import passport from 'passport-strategy';
import util from 'util';

export default function Strategy (options, verify) {
  passport.Strategy.call(this);
  this.name = 'mock';
  this._options = options;
  this._verify = verify;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function (req, options) {
  const callback = function (error, user, info) {
    if (error) {
      return this.error(error);
    }

    if (info && info.pass) {
      return this.pass();
    }

    if (info && info.url) {
      return this.redirect(info.url, info.status);
    }

    if (!user) {
      return this.fail(info.challenge, info.status);
    }

    return this.success(user, info);
  }.bind(this);

  this._verify(callback);
};
