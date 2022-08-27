import type {
  DefaultKey,
  KeyFactory,
  FactoryObject,
  QueryKeyFactoryResult,
  FactoryOutput,
  FactoryOutputCallback,
  ValidateFactory,
} from './types';

export function createQueryKeys<Key extends string>(key: Key): DefaultKey<Key>;
export function createQueryKeys<Key extends string, Factory extends FactoryObject>(
  key: Key,
  factory: ValidateFactory<Factory>,
): QueryKeyFactoryResult<Key, ValidateFactory<Factory>>;

export function createQueryKeys<Key extends string, FactorySchema extends FactoryObject>(
  key: Key,
  factory?: ValidateFactory<FactorySchema>,
): DefaultKey<Key> | QueryKeyFactoryResult<Key, ValidateFactory<FactorySchema>> {
  if (factory == null) {
    return {
      default: [key] as const,
    };
  }

  const factoryKeys = Object.keys(factory);

  assertFactoryKeys(factoryKeys);

  const createKey: KeyFactory<Key> = (scope, scopeValue) => {
    if (scopeValue != null) {
      return [key, scope, scopeValue] as const;
    }

    return [key, scope] as const;
  };

  type Factory = FactoryOutput<Key, FactorySchema>;

  const factoryMap = factoryKeys.reduce((map, factoryKey) => {
    const currentValue = factory[factoryKey];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let yieldValue: any;

    if (typeof currentValue === 'function') {
      type ResultCallback = FactoryOutputCallback<Key, typeof factoryKey, typeof currentValue>;

      const resultCallback: ResultCallback = (...args) => {
        const result = currentValue(...args);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return createKey(factoryKey, result) as any;
      };

      resultCallback.toScope = () => [key, factoryKey] as const;

      yieldValue = resultCallback;
    } else {
      yieldValue = createKey(factoryKey, currentValue ?? undefined);
    }

    map.set(factoryKey, yieldValue);

    return map;
  }, new Map<keyof Factory, Factory[keyof Factory]>());

  return {
    default: [key] as const,
    ...Object.fromEntries(factoryMap),
  };
}

export const assertFactoryKeys = (keys: string[]): void => {
  const keysSet = new Set(keys);

  if (keysSet.has('default')) {
    throw new Error(`"default" is a key reserved for the "createQueryKeys" function`);
  }
};
