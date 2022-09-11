import { createQueryKeys } from './create-query-keys';
import { omitPrototype } from './internals';
import { QueryKeyStoreSchema, QueryKeyStore } from './types';

export function createQueryKeyStore<StoreSchema extends QueryKeyStoreSchema>(
  schema: StoreSchema,
): QueryKeyStore<StoreSchema> {
  const keys = Object.keys(schema);

  const store = keys.reduce((storeMap, key) => {
    const factory = schema[key];

    const result = factory ? createQueryKeys(key, factory) : createQueryKeys(key);

    storeMap.set(key, result);
    return storeMap;
  }, new Map());

  return omitPrototype(Object.fromEntries(store));
}
