import { omitPrototype } from './internals';
import { AnyQueryKeyFactoryResult, StoreFromMergedQueryKeys } from './types';

export function mergeQueryKeys<FactoryOutputs extends AnyQueryKeyFactoryResult[]>(
  ...schemas: FactoryOutputs
): StoreFromMergedQueryKeys<FactoryOutputs> {
  const factory = schemas.reduce((factoryMap, current) => {
    const [factoryKey] = current.default;

    factoryMap.set(factoryKey, current);
    return factoryMap;
  }, new Map());

  return omitPrototype(Object.fromEntries(factory));
}
