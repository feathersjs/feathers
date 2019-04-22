const { _ } = require('@feathersjs/commons');

const AdapterService = require('./service');
const filterQuery = require('./filter-query');
const sort = require('./sort');

// Return a function that filters a result object or array
// and picks only the fields passed as `params.query.$select`
// and additional `otherFields`
const select = function select (params, ...otherFields) {
  const fields = params && params.query && params.query.$select;

  if (Array.isArray(fields) && otherFields.length) {
    fields.push(...otherFields);
  }

  const convert = result => {
    if (!Array.isArray(fields)) {
      return result;
    }

    return _.pick(result, ...fields);
  };

  return result => {
    if (Array.isArray(result)) {
      return result.map(convert);
    }

    return convert(result);
  };
};

module.exports = Object.assign({
  select,
  filterQuery,
  AdapterService
}, sort);
