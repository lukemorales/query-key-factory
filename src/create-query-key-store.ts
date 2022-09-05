import { createQueryKeys } from './create-query-keys';
import { QueryKeyStoreSchema, QueryKeyStore } from './types';

export function createQueryKeyStore<StoreSchema extends QueryKeyStoreSchema>(
  storeSchema: StoreSchema,
): QueryKeyStore<StoreSchema> {
  const storeKeys = Object.keys(storeSchema);

  const store = storeKeys.reduce((storeMap, key) => {
    const scopeFactory = storeSchema[key];

    const factoryResult = scopeFactory ? createQueryKeys(key, scopeFactory) : createQueryKeys(key);

    storeMap.set(key, factoryResult);
    return storeMap;
  }, new Map());

  return Object.fromEntries(store);
}
