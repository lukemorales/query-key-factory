import type { QueryFunction } from '@tanstack/query-core';

import { Add, ExtractInternalKeys } from './internals';

type MergeInsertions<T> = T extends object ? { [K in keyof T]: MergeInsertions<T[K]> } : T;

export type AnyQueryKey = readonly [string, ...any[]];

type AnyMutableOrReadonlyArray = any[] | readonly any[];

type Tuple = [ValidValue, ...Array<ValidValue | undefined>];

export type KeyTuple = Tuple | Readonly<Tuple>;

export type ValidValue = string | number | boolean | object;

type NullableQueryKeyRecord = Record<'queryKey', KeyTuple | null>;

type QueryKeyRecord = Record<'queryKey', KeyTuple>;

type KeySchemaWithContextualQueries = NullableQueryKeyRecord & {
  contextQueries: FactorySchema;
};

type QueryFactorySchema = NullableQueryKeyRecord & {
  queryFn: QueryFunction;
};

type QueryFactoryWithContextualQueriesSchema = NullableQueryKeyRecord & {
  queryFn: QueryFunction;
  contextQueries: FactorySchema;
};

type DynamicKeySchemaWithContextualQueries = QueryKeyRecord & {
  contextQueries: FactorySchema;
};

type DynamicQueryFactorySchema = QueryKeyRecord & {
  queryFn: QueryFunction;
};

type DynamicQueryFactoryWithContextualQueriesSchema = QueryKeyRecord & {
  queryFn: QueryFunction;
  contextQueries: FactorySchema;
};

type FactoryProperty =
  | null
  | KeyTuple
  | NullableQueryKeyRecord
  | KeySchemaWithContextualQueries
  | QueryFactorySchema
  | QueryFactoryWithContextualQueriesSchema;

type DynamicKey = (
  ...args: any[]
) =>
  | DynamicQueryFactoryWithContextualQueriesSchema
  | DynamicQueryFactorySchema
  | DynamicKeySchemaWithContextualQueries
  | QueryKeyRecord
  | KeyTuple;

export type FactorySchema = Record<string, FactoryProperty | DynamicKey>;

type InvalidSchema<Schema extends FactorySchema> = Omit<Schema, `_${string}`>;

export type ValidateFactory<Schema extends FactorySchema> = Schema extends {
  [P in ExtractInternalKeys<Schema>]: Schema[P];
}
  ? InvalidSchema<Schema>
  : Schema;

type ExtractNullableKey<Key extends KeyTuple | null | undefined> = Key extends
  | [...infer Value]
  | readonly [...infer Value]
  ? Value
  : Key extends null | undefined | unknown
  ? null
  : never;

type ComposeQueryKey<BaseKey extends AnyMutableOrReadonlyArray, Key> = Key extends KeyTuple
  ? readonly [...BaseKey, ...Key]
  : readonly [...BaseKey];

export type QueryOptions<
  Keys extends AnyMutableOrReadonlyArray,
  Fetcher extends QueryFunction,
  FetcherResult extends ReturnType<Fetcher> = ReturnType<Fetcher>,
> = {
  queryKey: readonly [...Keys];
  queryFn: QueryFunction<Awaited<FetcherResult>, readonly [...Keys]>;
};

type FactoryWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends KeySchemaWithContextualQueries | DynamicKeySchemaWithContextualQueries,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  ContextQueries extends Schema['contextQueries'] = Schema['contextQueries'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? Omit<QueryOptions<ComposedKey, QueryFunction>, 'queryFn'> & {
      _ctx: {
        [P in keyof ContextQueries]: ContextQueries[P] extends DynamicKey
          ? DynamicFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
          : ContextQueries[P] extends FactoryProperty
          ? StaticFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
          : never;
      };
    }
  : Omit<QueryOptions<ComposedKey, QueryFunction>, 'queryFn'> &
      DefinitionKey<BaseKey> & {
        _ctx: {
          [P in keyof ContextQueries]: ContextQueries[P] extends DynamicKey
            ? DynamicFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
            : ContextQueries[P] extends FactoryProperty
            ? StaticFactoryOutput<[...ComposedKey, P], ContextQueries[P]>
            : never;
        };
      };

type FactoryQueryKeyRecordOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends NullableQueryKeyRecord | QueryKeyRecord,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? Omit<QueryOptions<BaseKey, QueryFunction>, 'queryFn'>
  : Omit<QueryOptions<ComposedKey, QueryFunction>, 'queryFn'> & DefinitionKey<BaseKey>;

type FactoryQueryOptionsOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends QueryFactorySchema | DynamicQueryFactorySchema,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  QueryFn extends Schema['queryFn'] = Schema['queryFn'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? QueryOptions<BaseKey, QueryFn>
  : QueryOptions<ComposedKey, QueryFn> & DefinitionKey<BaseKey>;

type FactoryQueryOptionsWithContextualQueriesOutput<
  BaseKey extends AnyMutableOrReadonlyArray,
  Schema extends QueryFactoryWithContextualQueriesSchema | DynamicQueryFactoryWithContextualQueriesSchema,
  SchemaQueryKey extends Schema['queryKey'] = Schema['queryKey'],
  QueryFn extends Schema['queryFn'] = Schema['queryFn'],
  ContextQueries extends Schema['contextQueries'] = Schema['contextQueries'],
  Key extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? QueryOptions<Key, QueryFn> & {
      _ctx: {
        [P in keyof ContextQueries]: ContextQueries[P] extends DynamicKey
          ? DynamicFactoryOutput<[...Key, P], ContextQueries[P]>
          : ContextQueries[P] extends FactoryProperty
          ? StaticFactoryOutput<[...Key, P], ContextQueries[P]>
          : never;
      };
    }
  : DefinitionKey<BaseKey> &
      QueryOptions<Key, QueryFn> & {
        _ctx: {
          [P in keyof ContextQueries]: ContextQueries[P] extends DynamicKey
            ? DynamicFactoryOutput<[...Key, P], ContextQueries[P]>
            : ContextQueries[P] extends FactoryProperty
            ? StaticFactoryOutput<[...Key, P], ContextQueries[P]>
            : never;
        };
      };

type DynamicFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Generator extends DynamicKey,
  Output extends ReturnType<Generator> = ReturnType<Generator>,
> = {
  (...args: Parameters<Generator>): Output extends [...infer TupleResult] | readonly [...infer TupleResult]
    ? Omit<QueryOptions<[...Keys, ...TupleResult], QueryFunction>, 'queryFn'>
    : Output extends DynamicQueryFactoryWithContextualQueriesSchema
    ? Omit<FactoryQueryOptionsWithContextualQueriesOutput<Keys, Output>, '_def'>
    : Output extends DynamicQueryFactorySchema
    ? Omit<FactoryQueryOptionsOutput<Keys, Output>, '_def'>
    : Output extends DynamicKeySchemaWithContextualQueries
    ? Omit<FactoryWithContextualQueriesOutput<Keys, Output>, '_def'>
    : Output extends QueryKeyRecord
    ? Omit<FactoryQueryKeyRecordOutput<Keys, Output>, '_def'>
    : never;
} & DefinitionKey<Keys>;

export type AnyFactoryOutputCallback = DynamicFactoryOutput<[string, ...any[]], DynamicKey>;

type StaticFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Property extends FactoryProperty,
> = Property extends null
  ? Omit<QueryOptions<Keys, QueryFunction>, 'queryFn'>
  : Property extends [...infer Result] | readonly [...infer Result]
  ? DefinitionKey<Keys> & Omit<QueryOptions<[...Keys, ...Result], QueryFunction>, 'queryFn'>
  : Property extends QueryFactoryWithContextualQueriesSchema
  ? FactoryQueryOptionsWithContextualQueriesOutput<Keys, Property>
  : Property extends QueryFactorySchema
  ? FactoryQueryOptionsOutput<Keys, Property>
  : Property extends KeySchemaWithContextualQueries
  ? FactoryWithContextualQueriesOutput<Keys, Property>
  : Property extends NullableQueryKeyRecord
  ? FactoryQueryKeyRecordOutput<Keys, Property>
  : never;

type FactoryOutput<Key extends string, Schema extends FactorySchema> = DefinitionKey<[Key]> & {
  [P in keyof Schema]: Schema[P] extends DynamicKey
    ? DynamicFactoryOutput<[Key, P], Schema[P]>
    : Schema[P] extends FactoryProperty
    ? StaticFactoryOutput<[Key, P], Schema[P]>
    : never;
};

export type DefinitionKey<Key extends AnyMutableOrReadonlyArray> = {
  _def: readonly [...Key];
};

export type QueryKeyFactoryResult<Key extends string, Schema extends FactorySchema> = FactoryOutput<Key, Schema>;

export type AnyQueryKeyFactoryResult = DefinitionKey<[string]> | QueryKeyFactoryResult<string, any>;

type inferRecordQueryKeys<Target extends object> = {
  [P in Exclude<keyof Target, 'queryFn'>]: Target[P] extends AnyMutableOrReadonlyArray
    ? Target[P]
    : Target[P] extends object
    ? {
        [K in keyof Target[P]]: inferSchemaProperty<Target[P][K]>;
      }
    : never;
};

type inferSchemaProperty<Value> = Value extends AnyMutableOrReadonlyArray
  ? Value
  : Value extends StaticFactoryOutput<any[], any>
  ? inferRecordQueryKeys<Value>
  : Value extends AnyFactoryOutputCallback
  ? Record<'_def', Value['_def']> & inferRecordQueryKeys<ReturnType<Value>>
  : never;

export type inferQueryKeys<Schema extends AnyQueryKeyFactoryResult> = {
  [P in keyof Schema]: MergeInsertions<inferSchemaProperty<Schema[P]>>;
};

export type StoreFromMergedQueryKeys<
  QueryKeyFactoryResults extends AnyQueryKeyFactoryResult[],
  CurrentIndex extends number = 0,
> = QueryKeyFactoryResults[CurrentIndex] extends null | undefined
  ? {}
  : {
      [P in QueryKeyFactoryResults[CurrentIndex]['_def'][0]]: QueryKeyFactoryResults[CurrentIndex];
    } & StoreFromMergedQueryKeys<QueryKeyFactoryResults, Add<CurrentIndex, 1>>;

export type QueryKeyStoreSchema = Record<string, null | FactorySchema>;

export type QueryKeyStore<StoreSchema extends QueryKeyStoreSchema> = {
  [P in keyof StoreSchema & string]: StoreSchema[P] extends FactorySchema
    ? QueryKeyFactoryResult<P, StoreSchema[P]>
    : DefinitionKey<[P]>;
};

export type inferQueryKeyStore<Store extends QueryKeyStore<any>> = {
  [P in keyof Store]: inferQueryKeys<Store[P]>;
};
