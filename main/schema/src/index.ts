import addFormats, {
  FormatName,
  FormatOptions,
  FormatsPluginOptions,
} from "https://esm.sh/ajv-formats@2.1.1";
import { HookContext } from "../../feathers/mod.ts";
import { ResolverStatus } from "./resolver.ts";

export type { FromSchema } from "https://deno.land/x/json_schema_to_ts@v2.5.5/index.d.ts";
export { addFormats };
export type { FormatName, FormatOptions, FormatsPluginOptions };

export * from "./schema.ts";
export * from "./resolver.ts";
export * from "./hooks/index.ts";
export * from "./json-schema.ts";
export * from "./default-schemas.ts";

export * as hooks from "./hooks/index.ts";
export * as jsonSchema from "./json-schema.ts";

export type Infer<S extends { _type: any }> = S["_type"];

export type Combine<S extends { _type: any }, U> =
  & Pick<Infer<S>, Exclude<keyof Infer<S>, keyof U>>
  & U;

declare module "../../feathers/src/declarations.ts" {
  interface Params {
    resolve?: ResolverStatus<any, HookContext>;
  }
}
