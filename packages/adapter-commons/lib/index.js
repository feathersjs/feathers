'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function (m, exports) {
    for (var p in m) if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { 'default': mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
exports.select = exports.OPERATORS = exports.FILTERS = exports.filterQuery = exports.AdapterService = void 0;
const commons_1 = require('@feathersjs/commons');
var service_1 = require('./service');
Object.defineProperty(exports, 'AdapterService', { enumerable: true, get: function () { return service_1.AdapterService; } });
var filter_query_1 = require('./filter-query');
Object.defineProperty(exports, 'filterQuery', { enumerable: true, get: function () { return __importDefault(filter_query_1).default; } });
Object.defineProperty(exports, 'FILTERS', { enumerable: true, get: function () { return filter_query_1.FILTERS; } });
Object.defineProperty(exports, 'OPERATORS', { enumerable: true, get: function () { return filter_query_1.OPERATORS; } });
__exportStar(require('./sort'), exports);
// Return a function that filters a result object or array
// and picks only the fields passed as `params.query.$select`
// and additional `otherFields`
function select (params, ...otherFields) {
    const fields = params && params.query && params.query.$select;
    if (Array.isArray(fields) && otherFields.length) {
        fields.push(...otherFields);
    }
    const convert = (result) => {
        if (!Array.isArray(fields)) {
            return result;
        }
        return commons_1._.pick(result, ...fields);
    };
    return (result) => {
        if (Array.isArray(result)) {
            return result.map(convert);
        }
        return convert(result);
    };
}
exports.select = select;
//# sourceMappingURL=index.js.map