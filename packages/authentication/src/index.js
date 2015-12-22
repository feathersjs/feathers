import makeDebug from 'debug';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import passportLocal from 'passport-local';
var LocalStrategy = passportLocal.Strategy;
import bcrypt from 'bcrypt';

var defaults = {
  userEndpoint: '/api/users',
  usernameField: 'username',
  passwordField: 'password',
  userProperty: passport._userProperty || 'user',
  loginEndpoint: '/api/login',
  loginError: 'Invalid login.',
  jwtOptions: {
    expiresIn: 36000, // seconds to expiration. Default is 10 hours.
  },
  passport: passport,
};
const debug = makeDebug('feathers-authentication');

export default function(config) {
  var settings = _.merge(defaults, config);

  if(!settings.secret) {
    throw new Error('A JWT secret must be provided!');
  }

  return function() {
    var app = this;
    var oldSetup = app.setup;

    app.use(settings.passport.initialize());
    var strategy = settings.strategy || getDefaultStrategy(app, settings);
    passport.use(strategy);

    debug('setting up feathers-authentication');

    // Route for token refresh
    app.post(settings.loginEndpoint + '/refresh', verifyToken, function(req, res) {
      var data = req.authData;
      delete data.password;
      var token = jwt.sign(data, settings.secret, settings.jwtOptions);
      return res.json({
        token: token,
        data: data
      });
    });

    // Add a route for passport login and token refresh.
    app.post(settings.loginEndpoint, verifyToken, function(req, res, next) {
      // Non-expired token was passed in and refreshed
      if (req.authData) {
        var data = req.authData;
        delete req.authData.password;
        var token = jwt.sign(req.authData, settings.secret, settings.jwtOptions);
        return res.json({
          token: token,
          data: data
        });

      // Otherwise, authenticate the user and return a token
      } else {
        passport.authenticate('local', { session: false }, function(err, user) {
          if (err) {
            return res.status(500).json(err);
          }

          // Login was successful. Generate and send token.
          if (user) {
            user = !user.toJSON ? user : user.toJSON();
            delete user.password;
            var token = jwt.sign(user, settings.secret, settings.jwtOptions);
            return res.json({
              token: token,
              data: user
            });

          // Login failed.
          } else {
            return res.status(401).json({
              code: 401,
              name: 'NotAuthenticated',
              message: settings.loginError
            });
          }
        })(req, res, next);
      }
    })

    // Make the Passport user available for REST services.
    .use(function(req, res, next) {
      if (req.headers.authorization) {
        var token = req.headers.authorization.split(' ')[1];
        debug('Got an Authorization token', token);
        // TODO: Move token verification into its own middleware. See line ~44.
        jwt.verify(token, settings.secret, function(err, data) {
          if (err) {
            // Return a 401 Unauthorized if the token has expired.
            if (err.name === 'TokenExpiredError') {
              return res.status(401).json(err);
            }
            return next(err);
          }
          // A valid token's data is set up on feathers.user.
          req.feathers = _.extend({ user: data }, req.feathers);
          return next();
        });
      } else {
        return next();
      }
    });

    app.setup = function() {
      var result = oldSetup.apply(this, arguments);
      var io = app.io;
      var primus = app.primus;

      debug('running app.setup');

      function setUserData(socket, data) {
        socket.feathers = _.extend({ user: data }, socket.feathers);
      }

      function checkToken(token, socket, callback) {
        if (!token) {
          return callback(null, true);
        }
        jwt.verify(token, settings.secret, function(err, data) {
          if (err) {
            return callback(err);
          }
          setUserData(socket, data);
          callback(null, data);
        });
      }

      // Socket.io middleware
      if (io) {
        debug('intializing SocketIO middleware');
        io.use(function (socket, next) {

          // If there's a token in place, decode it and set up the feathers.user
          checkToken(socket.handshake.query.token, socket, function(err, data){
            if(err) {
              return next(err);
            }

            // If no token was passed, still allow the websocket. Service hooks can take care of Auth.
            if(data === true) {
              return next(null, true);
            }

            socket.on('authenticate', function (data) {
              checkToken(data.token, socket, function (err, data) {
                delete data.password;
                if (data) {
                  socket.emit('authenticated', data);
                }
              });
            });

            return next(null, data);
          });
        });
      }

      // Primus middleware
      if(primus) {
        debug('intializing Primus middleware');
        primus.authorize(function(req, done) {
          checkToken(req.handshake.query.token, req, done);
        });
      }

      return result;
    };
  };
  function verifyToken(req, res, next) {
    if(req.body.token) {
      jwt.verify(req.body.token, settings.secret, function (err, data) {
        if (err) {
          // Return a 401 Unauthorized if the token has expired.
          if (err.name === 'TokenExpiredError') {
            return res.status(401).json(err);
          }
          return next(err);
        }
        req.authData = data;
        next();
      });
    } else {
      next();
    }
  }
}

function getDefaultStrategy(app, settings){
  var strategySetup = {
    usernameField: settings.usernameField,
    passwordField: settings.passwordField
  };
  return new LocalStrategy(strategySetup, function(username, password, done) {
    var findParams = {
      internal: true,
      query: {}
    };
    findParams.query[settings.usernameField] = username;
    app.service(settings.userEndpoint).find(findParams, function(error, users) {
      // Handle any 500 server errors.
      if(error) {
        return done(error);
      }
      // Handle bad username.
      if(!users[0]) {
        return done(null, false);
      }
      // Check password
      bcrypt.compare(password, users[0][settings.passwordField], function(err, res) {
        // Handle 500 server error.
        if (err) {
          return done(err);
        }
        // Successful login.
        if (res) {
          return done(null, users[0]);
        // Handle bad password.
        } else {
          return done(null, false);
        }
      });
    });
  });
}

// Make the password hashing hook available separately.
export var hooks = require('./hooks');
