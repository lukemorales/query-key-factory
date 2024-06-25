import { createQueryKeys } from './create-query-keys';
import type {
  QueryFactorySchema,
  QueryKeyFactoryResult,
} from './create-query-keys.types';
import { omitPrototype } from './internals';
import type { DefinitionKey } from './types';

type QueryKeyStoreSchema = Record<string, null | QueryFactorySchema>;

export type QueryKeyStore<StoreSchema extends QueryKeyStoreSchema> = {
  [P in keyof StoreSchema & string]: StoreSchema[P] extends QueryFactorySchema ?
    QueryKeyFactoryResult<P, StoreSchema[P]>
  : DefinitionKey<[P]>;
};

/**
 * @deprecated This function will be removed in the next major version.
 * Please use `mergeQueryFactories` with `defineQueryOperations` instead.
 */
export function createQueryKeyStore<StoreSchema extends QueryKeyStoreSchema>(
  schema: StoreSchema,
): QueryKeyStore<StoreSchema> {
  const keys = Object.keys(schema);

  const store = keys.reduce((storeMap, key) => {
    const factory = schema[key];

    const result =
      factory ? createQueryKeys(key, factory) : createQueryKeys(key);

    storeMap.set(key, result);

    return storeMap;
  }, new Map());

  return omitPrototype(Object.fromEntries(store));
}
