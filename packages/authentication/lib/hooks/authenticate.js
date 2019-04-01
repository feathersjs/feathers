"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const errors_1 = require("@feathersjs/errors");
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('@feathersjs/authentication/hooks/authenticate');
exports.default = (_settings, ..._strategies) => {
    const settings = typeof _settings === 'string'
        ? { strategies: lodash_1.flatten([_settings, ..._strategies]) }
        : _settings;
    if (!_settings || settings.strategies.length === 0) {
        throw new Error('The authenticate hook needs at least one allowed strategy');
    }
    return (context) => {
        const { app, params, type, path, service } = context;
        const { service: authPath = app.get('defaultAuthentication'), strategies } = settings;
        const { provider, authentication } = params;
        const authService = app.service(authPath);
        debug(`Running authenticate hook on '${path}'`);
        if (type && type !== 'before') {
            return Promise.reject(new errors_1.NotAuthenticated('The authenticate hook must be used as a before hook'));
        }
        if (!authService || typeof authService.authenticate !== 'function') {
            return Promise.reject(new errors_1.NotAuthenticated(`Could not find authentication service at '${authPath}'`));
        }
        if (service === authService) {
            return Promise.reject(new errors_1.NotAuthenticated('The authenticate hook does not need to be used on the authentication service'));
        }
        if (authentication && authentication !== true) {
            const authParams = lodash_1.omit(params, 'provider', 'authentication');
            debug('Authenticating with', authentication, strategies);
            return authService.authenticate(authentication, authParams, ...strategies)
                .then(authResult => {
                context.params = lodash_1.merge({}, params, lodash_1.omit(authResult, 'accessToken'));
                return context;
            });
        }
        else if (!authentication && provider) {
            return Promise.reject(new errors_1.NotAuthenticated('Not authenticated'));
        }
        return context;
    };
};
//# sourceMappingURL=authenticate.js.map