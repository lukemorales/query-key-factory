import { assertSchemaKeys, omitPrototype } from './internals';
import type {
  FactorySchema,
  QueryKeyFactoryResult,
  ValidateFactory,
  AnyFactoryOutputCallback,
  AnyQueryKey,
} from './create-query-keys.types';
import { DefinitionKey } from './types';

export function createQueryKeys<Key extends string>(queryDef: Key): DefinitionKey<[Key]>;
export function createQueryKeys<Key extends string, Schema extends FactorySchema>(
  queryDef: Key,
  schema: ValidateFactory<Schema>,
): QueryKeyFactoryResult<Key, Schema>;
export function createQueryKeys<Key extends string, Schema extends FactorySchema>(
  queryDef: Key,
  schema?: ValidateFactory<Schema>,
): DefinitionKey<[Key]> | QueryKeyFactoryResult<Key, Schema> {
  const defKey: DefinitionKey<[Key]> = {
    _def: [queryDef] as const,
  };

  if (schema == null) {
    return omitPrototype(defKey);
  }

  const transformSchema = <$Factory extends FactorySchema>(factory: $Factory, mainKey: AnyQueryKey) => {
    type $FactoryProperty = keyof $Factory;

    const keys = assertSchemaKeys(factory);
    return keys.reduce((factoryMap, factoryKey) => {
      const value = factory[factoryKey];
      const key = [...mainKey, factoryKey] as const;

      const isReadonlyArray = (arg: unknown): arg is readonly any[] => Array.isArray(arg);

      let yieldValue: any;

      if (typeof value === 'function') {
        const resultCallback: AnyFactoryOutputCallback = (...args) => {
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
