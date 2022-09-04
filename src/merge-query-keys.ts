import { AnyFactoryOutput, FactoryFromMergedQueryKeys } from './types';

export function mergeQueryKeys<FactoryOutputs extends AnyFactoryOutput[]>(
  ...schemas: FactoryOutputs
): FactoryFromMergedQueryKeys<FactoryOutputs> {
  const factory = schemas.reduce((factoryMap, current) => {
    const [factoryKey] = current.default;

    factoryMap.set(factoryKey, current);
    return factoryMap;
  }, new Map());

  return Object.fromEntries(factory);
}
