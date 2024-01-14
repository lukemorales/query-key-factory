import { makeQueryOptions } from '../src/create-query-options';

import type {
  AnyQueryFactoryOutputCallback,
  AnyQueryKey,
  QueryFactorySchema,
  QueryKeyFactoryResult,
  ValidateFactory,
} from './create-query-keys.types';
import { assertSchemaKeys, omitPrototype } from './internals';
import { type DefinitionKey } from './types';

const a = makeQueryOptions({
  queryKey: ['yololo'],
});

export function createQueryKeys<Key extends string>(queryDef: Key): DefinitionKey<[Key]>;
export function createQueryKeys<Key extends string, Schema extends QueryFactorySchema>(
  queryDef: Key,
  schema: ValidateFactory<Schema>,
): QueryKeyFactoryResult<Key, ValidateFactory<Schema>>;
export function createQueryKeys<Key extends string, Schema extends QueryFactorySchema>(
  queryDef: Key,
  schema?: ValidateFactory<Schema>,
): DefinitionKey<[Key]> | QueryKeyFactoryResult<Key, ValidateFactory<Schema>> {
  const defKey: DefinitionKey<[Key]> = {
    _def: [queryDef] as const,
  };

  if (schema == null) {
    return omitPrototype(defKey);
  }

  const transformSchema = <$Factory extends QueryFactorySchema>(factory: $Factory, mainKey: AnyQueryKey) => {
    type $FactoryProperty = keyof $Factory;

    const keys = assertSchemaKeys(factory);
    return keys.reduce((factoryMap, factoryKey) => {
      const value = factory[factoryKey];
      const key = [...mainKey, factoryKey] as const;

      const isReadonlyArray = (arg: unknown): arg is readonly any[] => Array.isArray(arg);

      let yieldValue: any;

      if (typeof value === 'function') {
        const resultCallback: AnyQueryFactoryOutputCallback = (...args) => {
          const result = value(...args);

          if (isReadonlyArray(result)) {
            return omitPrototype({
              queryKey: [...key, ...result] as const,
            });
          }

          const innerKey = [...key, ...result.queryKey] as const;

          if ('queryFn' in result) {
            // type $QueryFnContext = Omit<QueryFunctionContext<typeof innerKey, any>, 'queryKey'>;

            const queryOptions = {
              queryKey: innerKey,
              queryFn: result.queryFn,
            };

            if ('contextQueries' in result) {
              const transformedSchema = transformSchema(result.contextQueries, innerKey);

              return omitPrototype({
                _ctx: omitPrototype(Object.fromEntries(transformedSchema)),
                ...queryOptions,
              });
            }

            return omitPrototype({
              ...queryOptions,
            });
          }

          if ('contextQueries' in result) {
            const transformedSchema = transformSchema(result.contextQueries, innerKey);

            return omitPrototype({
              _ctx: omitPrototype(Object.fromEntries(transformedSchema)),
              queryKey: innerKey,
            });
          }

          return omitPrototype({
            queryKey: innerKey,
          });
        };

        resultCallback._def = key;

        yieldValue = resultCallback;
      } else if (value == null) {
        yieldValue = omitPrototype({
          queryKey: key,
        });
      } else if (isReadonlyArray(value)) {
        yieldValue = omitPrototype({
          _def: key,
          queryKey: [...key, ...value] as const,
        });
      } else if ('queryFn' in value) {
        // type $QueryFnContext = Omit<QueryFunctionContext<typeof innerKey, any>, 'queryKey'>;

        const innerDefKey = { ...(value.queryKey ? { _def: key } : undefined) };
        const innerKey = [...key, ...(value.queryKey ?? [])] as const;

        const queryOptions = {
          queryKey: innerKey,
          queryFn: value.queryFn,
        };

        if ('contextQueries' in value) {
          const transformedSchema = transformSchema(value.contextQueries, innerKey);

          yieldValue = omitPrototype({
            _ctx: omitPrototype(Object.fromEntries(transformedSchema)),
            ...innerDefKey,
            ...queryOptions,
          });
        } else {
          yieldValue = omitPrototype({ ...innerDefKey, ...queryOptions });
        }
      } else if ('contextQueries' in value) {
        const innerDefKey = { ...(value.queryKey ? { _def: key } : undefined) };
        const innerKey = [...key, ...(value.queryKey ?? [])] as const;

        const transformedSchema = transformSchema(value.contextQueries, innerKey);

        yieldValue = omitPrototype({
          _ctx: omitPrototype(Object.fromEntries(transformedSchema)),
          queryKey: innerKey,
          ...innerDefKey,
        });
      } else {
        const innerDefKey = { ...(value.queryKey ? { _def: key } : undefined) };
        const innerKey = [...key, ...(value.queryKey ?? [])] as const;

        yieldValue = omitPrototype({
          queryKey: innerKey,
          ...innerDefKey,
        });
      }

      factoryMap.set(factoryKey, yieldValue);
      return factoryMap;
    }, new Map<$FactoryProperty, $Factory[$FactoryProperty]>());
  };

  const transformedSchema = transformSchema(schema, defKey._def);

  return omitPrototype({
    ...Object.fromEntries(transformedSchema),
    ...defKey,
  });
}
