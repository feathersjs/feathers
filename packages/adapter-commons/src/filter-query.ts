import { _ } from '@feathersjs/commons';
import { BadRequest } from '@feathersjs/errors';

function parse (number: any) {
  if (typeof number !== 'undefined') {
    return Math.abs(parseInt(number, 10));
  }

  return undefined;
}

// Returns the pagination limit and will take into account the
// default and max pagination settings
function getLimit (limit: any, paginate: any) {
  if (paginate && paginate.default) {
    const lower = typeof limit === 'number' && !isNaN(limit) ? limit : paginate.default;
    const upper = typeof paginate.max === 'number' ? paginate.max : Number.MAX_VALUE;

    return Math.min(lower, upper);
  }

  return limit;
}

// Makes sure that $sort order is always converted to an actual number
function convertSort (sort: any) {
  if (typeof sort !== 'object' || Array.isArray(sort)) {
    return sort;
  }

  return Object.keys(sort).reduce((result, key) => {
    result[key] = typeof sort[key] === 'object'
      ? sort[key] : parseInt(sort[key], 10);

    return result;
  }, {} as { [key: string]: number });
}

function cleanQuery (query: any, operators: any, filters: any): any {
  if (Array.isArray(query)) {
    return query.map(value => cleanQuery(value, operators, filters));
  } else if (_.isObject(query) && query.constructor === {}.constructor) {
    const result: { [key: string]: any } = {};

    _.each(query, (value, key) => {
      if (key[0] === '$') {
        if (filters[key] !== undefined) {
          return;
        }

        if (!operators.includes(key)) {
          throw new BadRequest(`Invalid query parameter ${key}`, query);
        }
      }

      result[key] = cleanQuery(value, operators, filters);
    });

    Object.getOwnPropertySymbols(query).forEach(symbol => {
      // @ts-ignore
      result[symbol] = query[symbol];
    });

    return result;
  }

  return query;
}

function assignFilters (object: any, query: any, filters: any, options: any) {
  if (Array.isArray(filters)) {
    _.each(filters, (key) => {
      if (query[key] !== undefined) {
        object[key] = query[key];
      }
    });
  } else {
    _.each(filters, (converter, key) => {
      const converted = converter(query[key], options);

      if (converted !== undefined) {
        object[key] = converted;
      }
    });
  }

  return object;
}

export const FILTERS = {
  $sort: (value: any) => convertSort(value),
  $limit: (value: any, options: any) => getLimit(parse(value), options.paginate),
  $skip: (value: any) => parse(value),
  $select: (value: any) => value
};

export const OPERATORS = ['$in', '$nin', '$lt', '$lte', '$gt', '$gte', '$ne', '$or'];

// Converts Feathers special query parameters and pagination settings
// and returns them separately a `filters` and the rest of the query
// as `query`
export default function filterQuery (query: any, options: any = {}) {
  const {
    filters: additionalFilters = {},
    operators: additionalOperators = []
  } = options;
  const result: { [key: string]: any } = {};

  result.filters = assignFilters({}, query, FILTERS, options);
  result.filters = assignFilters(result.filters, query, additionalFilters, options);

  result.query = cleanQuery(query, OPERATORS.concat(additionalOperators), result.filters);

  return result;
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(filterQuery, module.exports);
}
