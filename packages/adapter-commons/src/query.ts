import { _ } from '@feathersjs/commons'
import { BadRequest } from '@feathersjs/errors'
import { Query } from '@feathersjs/feathers'
import { FilterQueryOptions, FilterSettings, PaginationParams } from './declarations'

const parse = (value: any) => (typeof value !== 'undefined' ? parseInt(value, 10) : value)

const isPlainObject = (value: any) => _.isObject(value) && value.constructor === {}.constructor

const validateQueryProperty = (query: any, operators: string[] = []): Query => {
  if (!isPlainObject(query)) {
    return query
  }

  for (const key of Object.keys(query)) {
    if (key.startsWith('$') && !operators.includes(key)) {
      throw new BadRequest(`Invalid query parameter ${key}`, query)
    }

    const value = query[key]

    if (isPlainObject(value)) {
      query[key] = validateQueryProperty(value, operators)
    }
  }

  return {
    ...query
  }
}

const getFilters = (query: Query, settings: FilterQueryOptions) => {
  const filterNames = Object.keys(settings.filters)

  return filterNames.reduce(
    (current, key) => {
      const queryValue = query[key]
      const filter = settings.filters[key]

      if (filter) {
        const value = typeof filter === 'function' ? filter(queryValue, settings) : queryValue

        if (value !== undefined) {
          current[key] = value
        }
      }

      return current
    },
    {} as { [key: string]: any }
  )
}

const getQuery = (query: Query, settings: FilterQueryOptions) => {
  const keys = Object.keys(query).concat(Object.getOwnPropertySymbols(query) as any as string[])

  return keys.reduce((result, key) => {
    if (typeof key === 'string' && key.startsWith('$')) {
      if (settings.filters[key] === undefined) {
        throw new BadRequest(`Invalid filter value ${key}`)
      }
    } else {
      result[key] = validateQueryProperty(query[key], settings.operators)
    }

    return result
  }, {} as Query)
}

/**
 * Returns the converted `$limit` value based on the `paginate` configuration.
 * @param _limit The limit value
 * @param paginate The pagination options
 * @returns The converted $limit value
 */
export const getLimit = (_limit: any, paginate?: PaginationParams) => {
  const limit = parse(_limit)

  if (paginate && (paginate.default || paginate.max)) {
    const base = paginate.default || 0
    const lower = typeof limit === 'number' && !isNaN(limit) && limit >= 0 ? limit : base
    const upper = typeof paginate.max === 'number' ? paginate.max : Number.MAX_VALUE

    return Math.min(lower, upper)
  }

  return limit
}

export const OPERATORS = ['$in', '$nin', '$lt', '$lte', '$gt', '$gte', '$ne', '$or']

export const FILTERS: FilterSettings = {
  $skip: (value: any) => parse(value),
  $sort: (sort: any): { [key: string]: number } => {
    if (typeof sort !== 'object' || Array.isArray(sort)) {
      return sort
    }

    return Object.keys(sort).reduce(
      (result, key) => {
        result[key] = typeof sort[key] === 'object' ? sort[key] : parse(sort[key])

        return result
      },
      {} as { [key: string]: number }
    )
  },
  $limit: (_limit: any, { paginate }: FilterQueryOptions) => getLimit(_limit, paginate),
  $select: (select: any) => {
    if (Array.isArray(select)) {
      return select.map((current) => `${current}`)
    }

    return select
  },
  $or: (or: any, { operators }: FilterQueryOptions) => {
    if (Array.isArray(or)) {
      return or.map((current) => validateQueryProperty(current, operators))
    }

    return or
  },
  $and: (and: any, { operators }: FilterQueryOptions) => {
    if (Array.isArray(and)) {
      return and.map((current) => validateQueryProperty(current, operators))
    }

    return and
  }
}

/**
 * Converts Feathers special query parameters and pagination settings
 * and returns them separately as `filters` and the rest of the query
 * as `query`. `options` also gets passed the pagination settings and
 * a list of additional `operators` to allow when querying properties.
 *
 * @param query The initial query
 * @param options Options for filtering the query
 * @returns An object with `query` which contains the query without `filters`
 * and `filters` which contains the converted values for each filter.
 */
export function filterQuery(_query: Query, options: FilterQueryOptions = {}) {
  const query = _query || {}
  const settings = {
    ...options,
    filters: {
      ...FILTERS,
      ...options.filters
    },
    operators: OPERATORS.concat(options.operators || [])
  }

  return {
    filters: getFilters(query, settings),
    query: getQuery(query, settings)
  }
}
