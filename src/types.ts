import { Add, ExtractInternalKeys } from './internals';
import { QueryFunction } from './query-context.types';

type AnyObject = Record<string, unknown>;

export type AnyQueryKey = readonly [string, ...any[]];

type AnyMutableOrReadonlyArray = any[] | readonly any[];

type Tuple = [ValidValue, ...Array<ValidValue | undefined>];

export type KeyTuple = Tuple | Readonly<Tuple>;

export type ValidValue = string | number | boolean | AnyObject;

type KeySchemaWithContextualQueries = {
  queryKey: readonly [ValidValue] | null;
  context: FactorySchema;
};

type QueryFactorySchema = {
  queryKey: readonly [ValidValue] | null;
  queryFn: QueryFunction;
};

type QueryFactoryWithContextualQueriesSchema = {
  queryKey: readonly [ValidValue] | null;
  queryFn: QueryFunction;
  context: FactorySchema;
};

type DynamicKeySchemaWithContextualQueries = {
  queryKey: readonly [ValidValue];
  context: FactorySchema;
};

type DynamicQueryFactorySchema = {
  queryKey: readonly [ValidValue];
  queryFn: QueryFunction;
};

type DynamicQueryFactoryWithContextualQueriesSchema = {
  queryKey: readonly [ValidValue];
  queryFn: QueryFunction;
  context: FactorySchema;
};

type FactoryProperty =
  | null
  | KeyTuple
  | KeySchemaWithContextualQueries
  | QueryFactorySchema
  | QueryFactoryWithContextualQueriesSchema;

type DynamicKey = (
  ...args: any[]
) =>
  | DynamicQueryFactoryWithContextualQueriesSchema
  | DynamicQueryFactorySchema
  | DynamicKeySchemaWithContextualQueries
  | KeyTuple;

export type FactorySchema = Record<string, FactoryProperty | DynamicKey>;

type InvalidSchema<Schema extends FactorySchema> = Omit<Schema, `_${string}`>;

export type ValidateFactory<Schema extends FactorySchema> = Schema extends {
  [P in ExtractInternalKeys<Schema>]: Schema[P];
}
  ? InvalidSchema<Schema>
  : Schema;

type ExtractNullableKey<Key extends readonly [ValidValue] | null | undefined> = Key extends
  | [infer Value]
  | readonly [infer Value]
  ? Value
  : Key extends null | undefined | unknown
  ? null
  : never;

type ComposeQueryKey<BaseKey extends AnyMutableOrReadonlyArray, Key> = Key extends ValidValue
  ? readonly [...BaseKey, Key]
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
  ContextFactory extends Schema['context'] = Schema['context'],
  ComposedKey extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? Omit<QueryOptions<ComposedKey, QueryFunction>, 'queryFn'> & {
      _ctx: {
        [P in keyof ContextFactory]: ContextFactory[P] extends DynamicKey
          ? DynamicFactoryOutput<[...ComposedKey, P], ContextFactory[P]>
          : ContextFactory[P] extends FactoryProperty
          ? StaticFactoryOutput<[...ComposedKey, P], ContextFactory[P]>
          : never;
      };
    }
  : Omit<QueryOptions<ComposedKey, QueryFunction>, 'queryFn'> &
      DefinitionKey<BaseKey> & {
        _ctx: {
          [P in keyof ContextFactory]: ContextFactory[P] extends DynamicKey
            ? DynamicFactoryOutput<[...ComposedKey, P], ContextFactory[P]>
            : ContextFactory[P] extends FactoryProperty
            ? StaticFactoryOutput<[...ComposedKey, P], ContextFactory[P]>
            : never;
        };
      };

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
  ContextFactory extends Schema['context'] = Schema['context'],
  Key extends AnyMutableOrReadonlyArray = ComposeQueryKey<BaseKey, ExtractNullableKey<SchemaQueryKey>>,
> = SchemaQueryKey extends null
  ? QueryOptions<Key, QueryFn> & {
      _ctx: {
        [P in keyof ContextFactory]: ContextFactory[P] extends DynamicKey
          ? DynamicFactoryOutput<[...Key, P], ContextFactory[P]>
          : ContextFactory[P] extends FactoryProperty
          ? StaticFactoryOutput<[...Key, P], ContextFactory[P]>
          : never;
      };
    }
  : DefinitionKey<BaseKey> &
      QueryOptions<Key, QueryFn> & {
        _ctx: {
          [P in keyof ContextFactory]: ContextFactory[P] extends DynamicKey
            ? DynamicFactoryOutput<[...Key, P], ContextFactory[P]>
            : ContextFactory[P] extends FactoryProperty
            ? StaticFactoryOutput<[...Key, P], ContextFactory[P]>
            : never;
        };
      };

type DynamicFactoryOutput<
  Keys extends AnyMutableOrReadonlyArray,
  Generator extends DynamicKey,
  GeneratorOutput extends ReturnType<Generator> = ReturnType<Generator>,
> = {
  (...args: Parameters<Generator>): GeneratorOutput extends [...infer TupleResult] | readonly [...infer TupleResult]
    ? Omit<QueryOptions<[...Keys, ...TupleResult], QueryFunction>, 'queryFn'>
    : GeneratorOutput extends DynamicQueryFactoryWithContextualQueriesSchema
    ? Omit<FactoryQueryOptionsWithContextualQueriesOutput<Keys, GeneratorOutput>, '_def'>
    : GeneratorOutput extends DynamicQueryFactorySchema
    ? Omit<FactoryQueryOptionsOutput<Keys, GeneratorOutput>, '_def'>
    : GeneratorOutput extends DynamicKeySchemaWithContextualQueries
    ? Omit<FactoryWithContextualQueriesOutput<Keys, GeneratorOutput>, '_def'>
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

export type inferQueryKeys<Schema extends AnyQueryKeyFactoryResult> = {
  [P in keyof Schema]: Schema[P] extends (...args: any[]) => readonly any[] ? ReturnType<Schema[P]> : Schema[P];
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
  [P in keyof StoreSchema]: StoreSchema[P] extends FactorySchema
    ? QueryKeyFactoryResult<string & P, StoreSchema[P]>
    : DefinitionKey<[string & P]>;
};

export type inferQueryKeyStore<Store extends QueryKeyStore<any>> = {
  [P in keyof Store]: inferQueryKeys<Store[P]>;
};
