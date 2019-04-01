"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('@feathersjs/authentication/hooks/connection');
exports.default = (strategy = 'jwt') => (context) => {
    const { method, result, params: { connection } } = context;
    const { accessToken } = result, rest = __rest(result, ["accessToken"]);
    if (!connection) {
        return context;
    }
    const { authentication = {} } = connection;
    if (method === 'remove' && accessToken === authentication.accessToken) {
        debug('Removing authentication information from real-time connection');
        delete connection.authentication;
    }
    else if (method === 'create' && accessToken) {
        debug('Adding authentication information to real-time connection');
        Object.assign(connection, rest, {
            authentication: { strategy, accessToken }
        });
    }
    return context;
};
//# sourceMappingURL=connection.js.map