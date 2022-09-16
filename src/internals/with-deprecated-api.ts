import { DeprecatedKey } from './types';

const deprecatedKeys = new Map<DeprecatedKey | symbol, string>([
  ['default', '_def'],
  ['toScope', '_def'],
]);

export const withDeprecatedApi = <T extends Record<string, unknown>>(schema: T) => {
  const handler: ProxyHandler<T> = {
    get(target, property, receiver) {
      const originalValue = Reflect.get(target, property, receiver);

      if (
        typeof originalValue === 'function' ||
        (typeof originalValue === 'object' && !Array.isArray(originalValue) && originalValue != null)
      ) {
        return new Proxy(originalValue, handler);
      }

      const targetKeyForDeprecatedProperty = deprecatedKeys.get(property);

      if (targetKeyForDeprecatedProperty) {
        console.warn(
          `"${String(
            property,
          )}" is deprecated and will be removed in the next major version of "@lukemorales/query-key-factory". Please use "${targetKeyForDeprecatedProperty}" instead.`,
        );

        const targetValue = Reflect.get(target, targetKeyForDeprecatedProperty, receiver);

        if (property === 'toScope') {
          return () => targetValue;
        }

        return targetValue;
      }

      return originalValue;
    },
  };

  return new Proxy(schema, handler);
};
