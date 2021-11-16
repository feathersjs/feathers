import { _ } from '../../commons/src/index.ts';

export { AdapterService } from './service.ts';
export type { InternalServiceMethods, ServiceOptions, AdapterParams } from './service.ts';
export { filterQuery, FILTERS, OPERATORS } from './filter-query.ts';
export * from './sort.ts';

// Return a function that filters a result object or array
// and picks only the fields passed as `params.query.$select`
// and additional `otherFields`
export function select (params: any, ...otherFields: any[]) {
  const fields = params && params.query && params.query.$select;

  if (Array.isArray(fields) && otherFields.length) {
    fields.push(...otherFields);
  }

  const convert = (result: any) => {
    if (!Array.isArray(fields)) {
      return result;
    }

    return _.pick(result, ...fields);
  };

  return (result: any) => {
    if (Array.isArray(result)) {
      return result.map(convert);
    }

    return convert(result);
  };
}
