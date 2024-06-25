import { omitPrototype } from './internals/omit-prototype';
import type { AnyObject, Prettify } from './new-types';

type AnyOperationSchema = {
  $baseQueryKey: readonly [string];
};

type MergedQueryOperations<Operations extends AnyOperationSchema[]> =
  Operations extends (
    [
      infer First extends AnyOperationSchema,
      ...infer Rest extends AnyOperationSchema[],
    ]
  ) ?
    { [P in First['$baseQueryKey'][0]]: First } & MergedQueryOperations<Rest>
  : {};

export function mergeQueryOperations<Operations extends AnyOperationSchema[]>(
  ...schemas: Operations
): Prettify<MergedQueryOperations<Operations>> {
  const map: AnyObject = omitPrototype({});

  for (const schema of schemas) {
    const [key] = schema.$baseQueryKey;
    map[key] = schema;
  }

  return map as any;
}
