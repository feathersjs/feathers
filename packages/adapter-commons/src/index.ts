import { _ } from '@feathersjs/commons';

export { AdapterService, InternalServiceMethods, ServiceOptions } from './service';
export { default as filterQuery, FILTERS, OPERATORS } from './filter-query';
export * from './sort';

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
