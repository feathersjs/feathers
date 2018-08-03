const { _ } = require('./utils');

function parse (number) {
  if (typeof number !== 'undefined') {
    return Math.abs(parseInt(number, 10));
  }
}

// Returns the pagination limit and will take into account the
// default and max pagination settings
function getLimit (limit, paginate) {
  if (paginate && paginate.default) {
    const lower = typeof limit === 'number' ? limit : paginate.default;
    const upper = typeof paginate.max === 'number' ? paginate.max : Number.MAX_VALUE;

    return Math.min(lower, upper);
  }

  return limit;
}

// Makes sure that $sort order is always converted to an actual number
function convertSort (sort) {
  if (typeof sort !== 'object' || Array.isArray(sort)) {
    return sort;
  }

  const result = {};

  Object.keys(sort).forEach(key => {
    result[key] = typeof sort[key] === 'object'
      ? sort[key] : parseInt(sort[key], 10);
  });

  return result;
}

function cleanQuery (query, operators) {
  if (Array.isArray(query)) {
    return query.map((query) => cleanQuery(query, operators));
  }

  if (query && query.constructor === Object) {
    const result = {};
    _.each(query, (query, key) => {
      if (key[0] === '$' && operators.indexOf(key) === -1) return;
      result[key] = cleanQuery(query, operators);
    });
    return result;
  }

  return query;
}

function assignFilters (object, query, filters, options) {
  if (Array.isArray(filters)) {
    _.each(filters, (key) => {
      object[key] = query[key];
    });
  } else {
    _.each(filters, (converter, key) => {
      object[key] = converter(query[key], options);
    });
  }
}

const FILTERS = {
  $sort: (value) => convertSort(value),
  $limit: (value, options) => getLimit(parse(value), options.paginate),
  $skip: (value) => parse(value),
  $select: (value) => value
};

const OPERATORS = ['$in', '$nin', '$lt', '$lte', '$gt', '$gte', '$ne', '$or'];

// Converts Feathers special query parameters and pagination settings
// and returns them separately a `filters` and the rest of the query
// as `query`
module.exports = function filterQuery (query, options = {}) {
  let { filters: additionalFilters = {}, operators: additionalOperators = [] } = options;
  let result = {};

  result.filters = {};
  assignFilters(result.filters, query, FILTERS, options);
  assignFilters(result.filters, query, additionalFilters, options);

  let operators = OPERATORS.concat(additionalOperators);
  result.query = cleanQuery(query, operators);

  return result;
};
