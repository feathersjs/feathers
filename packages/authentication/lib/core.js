"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const lodash_1 = require("lodash");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const v4_1 = __importDefault(require("uuid/v4"));
const errors_1 = require("@feathersjs/errors");
const debug_1 = __importDefault(require("debug"));
const options_1 = __importDefault(require("./options"));
const debug = debug_1.default('@feathersjs/authentication/base');
const verifyJWT = util_1.promisify(jsonwebtoken_1.default.verify);
const createJWT = util_1.promisify(jsonwebtoken_1.default.sign);
class AuthenticationBase {
    constructor(app, configKey = 'authentication', options = {}) {
        if (!app || typeof app.use !== 'function') {
            throw new Error('An application instance has to be passed to the authentication service');
        }
        this.app = app;
        this.strategies = {};
        this.configKey = configKey;
        app.set('defaultAuthentication', app.get('defaultAuthentication') || configKey);
        app.set(configKey, lodash_1.merge({}, app.get(configKey), options));
    }
    get configuration() {
        // Always returns a copy of the authentication configuration
        return Object.assign({}, options_1.default, this.app.get(this.configKey));
    }
    get strategyNames() {
        return Object.keys(this.strategies);
    }
    register(name, strategy) {
        // Call the functions a strategy can implement
        if (typeof strategy.setName === 'function') {
            strategy.setName(name);
        }
        if (typeof strategy.setApplication === 'function') {
            strategy.setApplication(this.app);
        }
        if (typeof strategy.setAuthentication === 'function') {
            strategy.setAuthentication(this);
        }
        if (typeof strategy.verifyConfiguration === 'function') {
            strategy.verifyConfiguration();
        }
        // Register strategy as name
        this.strategies[name] = strategy;
    }
    getStrategies(...names) {
        // Returns all strategies for a list of names (including undefined)
        return names.map(name => this.strategies[name])
            .filter(current => !!current);
    }
    createJWT(payload, optsOverride, secretOverride) {
        const { secret, jwtOptions } = this.configuration;
        // Use configuration by default but allow overriding the secret
        const jwtSecret = secretOverride || secret;
        // Default jwt options merged with additional options
        const options = lodash_1.merge({}, jwtOptions, optsOverride);
        if (!options.jwtid) {
            // Generate a UUID as JWT ID by default
            options.jwtid = v4_1.default();
        }
        // @ts-ignore
        return createJWT(payload, secret, jwtSecret);
    }
    verifyJWT(accessToken, optsOverride, secretOverride) {
        const { secret, jwtOptions } = this.configuration;
        const jwtSecret = secretOverride || secret;
        const options = lodash_1.merge({}, jwtOptions, optsOverride);
        const { algorithm } = options;
        // Normalize the `algorithm` setting into the algorithms array
        if (algorithm && !options.algorithms) {
            options.algorithms = Array.isArray(algorithm) ? algorithm : [algorithm];
            delete options.algorithm;
        }
        // @ts-ignore
        return verifyJWT(accessToken, jwtSecret, options);
    }
    authenticate(authentication, params, ...allowed) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('Running authenticate for strategies', allowed);
            const strategies = this.getStrategies(...allowed)
                .filter(current => current && typeof current.authenticate === 'function');
            if (!authentication || strategies.length === 0) {
                // If there are no valid strategies or `authentication` is not an object
                throw new errors_1.NotAuthenticated(`No valid authentication strategy available`);
            }
            const { strategy } = authentication;
            const authParams = Object.assign(params, { authentication: true });
            // Throw an error is a `strategy` is indicated but not in the allowed strategies
            if (strategy && !allowed.includes(strategy)) {
                throw new errors_1.NotAuthenticated(`Invalid authentication strategy '${strategy}'`);
            }
            let error = null;
            for (const authStrategy of strategies) {
                try {
                    const authResult = yield authStrategy.authenticate(authentication, authParams);
                    return authResult;
                }
                catch (currentError) {
                    error = error || currentError;
                }
            }
            debug('All strategies error. First error is', error);
            throw error;
        });
    }
    parse(req, res, ...names) {
        return __awaiter(this, void 0, void 0, function* () {
            const strategies = this.getStrategies(...names)
                .filter(current => current && typeof current.parse === 'function');
            if (strategies.length === 0) {
                throw new errors_1.BadRequest('Authentication HTTP parser needs at least one allowed strategy');
            }
            debug('Strategies parsing HTTP header for authentication information', names);
            for (const authStrategy of strategies) {
                const value = yield authStrategy.parse(req, res);
                if (value !== null) {
                    return value;
                }
            }
            return null;
        });
    }
}
exports.AuthenticationBase = AuthenticationBase;
//# sourceMappingURL=core.js.map