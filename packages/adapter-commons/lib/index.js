"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const commons_1 = require("@feathersjs/commons");
var service_1 = require("./service");
exports.AdapterService = service_1.AdapterService;
var filter_query_1 = require("./filter-query");
exports.filterQuery = filter_query_1.default;
exports.FILTERS = filter_query_1.FILTERS;
exports.OPERATORS = filter_query_1.OPERATORS;
__export(require("./sort"));
// Return a function that filters a result object or array
// and picks only the fields passed as `params.query.$select`
// and additional `otherFields`
function select(params, ...otherFields) {
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