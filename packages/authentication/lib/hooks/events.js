"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('@feathersjs/authentication/hooks/connection');
const EVENTS = {
    create: 'login',
    remove: 'logout'
};
exports.default = () => (context) => {
    const { method, app, result, params } = context;
    const event = EVENTS[method];
    if (event && params.provider && result) {
        debug(`Sending authentication event '${event}'`);
        app.emit(event, result, params, context);
    }
    return context;
};
//# sourceMappingURL=events.js.map