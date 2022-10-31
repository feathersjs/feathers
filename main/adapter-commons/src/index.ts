import { _ } from "../../commons/mod.ts";
import { Params } from "../../feathers/mod.ts";

export * from "./declarations.ts";
export * from "./service.ts";
export { filterQuery, FILTERS, OPERATORS } from "./query.ts";
export * from "./sort.ts";

// Return a function that filters a result object or array
// and picks only the fields passed as `params.query.$select`
// and additional `otherFields`
export function select(params: Params, ...otherFields: string[]) {
  const queryFields: string[] | undefined = params?.query?.$select;

  if (!queryFields) {
    return (result: any) => result;
  }

  const resultFields = queryFields.concat(otherFields);
  const convert = (result: any) => _.pick(result, ...resultFields);

  return (result: any) => {
    if (Array.isArray(result)) {
      return result.map(convert);
    }

    return convert(result);
  };
}
