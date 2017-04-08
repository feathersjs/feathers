'use strict';

const _ = require('lodash');
const j = require('../../lib/transform');
const crypto = require('crypto');

const Generator = require('../../lib/generator');
const OAUTH2_STRATEGY_MAPPINGS = {
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

module.exports = class AuthGenerator extends Generator {
  prompting() {
    this.checkPackage();

    const prompts = [{
      type: 'checkbox',
      name: 'strategies',
      message: 'What authentication providers do you want to use? Other PassportJS strategies not in this list can still be configured manually.',
      default: 'providers',
      choices: [{
        name: 'Username + Password (Local)',
        value: 'local'
      }, {
        name: 'Google',
        value: 'google'
      }, {
        name: 'Facebook',
        value: 'facebook'
      }, {
        name: 'GitHub',
        value: 'github'
      }]
    }, {
      name: 'entity',
      message: 'What is the name of the user (entity) service?',
      default: 'users'
    }];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  _transformCode(code) {
    const ast = j(code);
    const appDeclaration = ast.findDeclaration('app');
    const configureServices = ast.findConfigure('services');
    const requireCall = 'const authentication = require(\'./authentication\');';

    if (appDeclaration.length === 0) {
      throw new Error('Could not find \'app\' variable declaration in app.js to insert database configuration. Did you modify app.js?');
    }

    if (configureServices.length === 0) {
      throw new Error('Could not find .configure(services) call in app.js after which to insert database configuration. Did you modify app.js?');
    }

    appDeclaration.insertBefore(requireCall);
    configureServices.insertBefore('app.configure(authentication);');

    return ast.toSource();
  }

  _writeConfiguration(context) {
    const config = Object.assign({}, this.defaultConfig);

    config.authentication = {
      secret: crypto.randomBytes(256).toString('hex'),
      strategies: [ 'jwt' ],
      path: '/authentication',
      service: context.kebabEntity,
      jwt: {
        header: { type: 'access' },
        audience: 'https://yourdomain.com',
        subject: 'anonymous',
        issuer: 'feathers',
        algorithm: 'HS256',
        expiresIn: '1d'
      }
    };

    if (context.strategies.indexOf('local') !== -1) {
      config.authentication.strategies.push('local');
      config.authentication.local = {
        entity: 'user',
        service: 'users',
        usernameField: 'email',
        passwordField: 'password'
      };
    }

    let includesOAuth = false;

    context.strategies.forEach(strategy => {
      if (OAUTH2_STRATEGY_MAPPINGS[strategy]) {
        const strategyConfig = {
          clientID: `your ${strategy} client id`,
          clientSecret: `your ${strategy} client secret`,
          successRedirect: '/'
        };
        includesOAuth = true;

        if (strategy === 'facebook') {
          strategyConfig.scope = ['public_profile', 'email'];
          strategyConfig.profileFields = ['id', 'displayName', 'first_name', 'last_name', 'email', 'gender', 'profileUrl', 'birthday', 'picture', 'permissions'];
        }

        config.authentication[strategy] = strategyConfig;
      }
    });

    if (includesOAuth) {
      config.authentication.cookie = {
        enabled: true,
        name: 'feathers-jwt',
        httpOnly: false,
        secure: false
      };
    }

    this.conflicter.force = true;
    this.fs.writeJSON(
      this.destinationPath('config', 'default.json'),
      config
    );
  }

  writing() {
    const dependencies = [
      'feathers-authentication',
      'feathers-authentication-hooks',
      'feathers-authentication-jwt'
    ];
    const context = Object.assign({
      kebabEntity: _.kebabCase(this.props.entity),
      camelEntity: _.camelCase(this.props.entity),
      oauthProviders: []
    }, this.props);

    // Set up strategies and add dependencies
    this.props.strategies.forEach(strategy => {
      const oauthProvider = OAUTH2_STRATEGY_MAPPINGS[strategy];

      if (oauthProvider) {
        dependencies.push('feathers-authentication-oauth2');
        dependencies.push(oauthProvider);
        context.oauthProviders.push({
          name: strategy,
          strategyName: `${_.upperFirst(strategy)}Strategy`,
          module: oauthProvider
        });
      } else {
        dependencies.push(`feathers-authentication-${strategy}`);
      }
    });

    // Create the users service
    this.composeWith(require.resolve('../service'), {
      props: {
        name: context.entity,
        path: `/${context.kebabEntity}`,
        authentication: context
      }
    });

    // If the file doesn't exist yet, add it to the app.js
    if (!this.fs.exists(this.destinationPath(this.libDirectory, 'authentication.js'))) {
      const appjs = this.destinationPath(this.libDirectory, 'app.js');

      this.conflicter.force = true;
      this.fs.write(appjs, this._transformCode(
        this.fs.read(appjs).toString()
      ));
    }

    this.fs.copyTpl(
      this.templatePath('authentication.js'),
      this.destinationPath(this.libDirectory, 'authentication.js'),
      context
    );

    this._writeConfiguration(context);
    this._packagerInstall(dependencies, {
      save: true
    });
  }
};
