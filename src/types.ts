import { Add, ExtractInternalKeys } from './internals';
import { QueryFunction } from './query-context.types';

type AnyObject = Record<string, unknown>;

export type AnyQueryKey = readonly [string, ...any[]];

type Tuple = [ValidValue, ...Array<ValidValue | undefined>];

export type KeyTuple = Tuple | Readonly<Tuple>;

export type ValidValue = string | number | boolean | AnyObject;

type DynamicKey = (
  ...args: any[]
) => KeySchemaWithQueries | QueryFactorySchema | QueryFactoryWithQueriesSchema | KeyTuple;

type KeySchemaWithQueries = {
  def: readonly [ValidValue] | null;
  queries: FactorySchema;
};

type QueryFactorySchema = {
  def: readonly [ValidValue] | null;
  queryFn: QueryFunction;
};

type QueryFactoryWithQueriesSchema = {
  def: readonly [ValidValue] | null;
  queryFn: QueryFunction;
  queries: FactorySchema;
};

type FactoryProperty = null | KeyTuple | KeySchemaWithQueries | QueryFactorySchema | QueryFactoryWithQueriesSchema;

export type FactorySchema = Record<string, FactoryProperty | DynamicKey>;

type InvalidSchema<Schema extends FactorySchema> = Omit<Schema, `_${string}`>;

export type ValidateFactory<Schema extends FactorySchema> = Schema extends {
  [P in ExtractInternalKeys<Schema>]: Schema[P];
}
  ? InvalidSchema<Schema>
  : Schema;

type ExtractNestedKey<Key extends readonly [ValidValue] | null> = Key extends [infer Value] | readonly [infer Value]
  ? Value
  : Key extends null
  ? null
  : never;

export type CallbackContext<
  Keys extends AnyMutableOrReadonlyArray | readonly any[],
  QueryFn extends QueryFunction,
  QueryFnReturn extends ReturnType<QueryFn> = ReturnType<QueryFn>,
> = {
  queryFn: QueryFunction<Awaited<QueryFnReturn>, Keys>;
  queryOptions: {
    queryKey: readonly [...Keys];
    queryFn: QueryFunction<Awaited<QueryFnReturn>, Keys>;
  };
};

type FactorySubQueriesKeyOutput<
  ParentKeys extends AnyMutableOrReadonlyArray,
  Schema extends KeySchemaWithQueries,
  SchemaDefKey extends Schema['def'] = Schema['def'],
  Factory extends Schema['queries'] = Schema['queries'],
  Key = ExtractNestedKey<SchemaDefKey>,
  DefKey extends AnyMutableOrReadonlyArray = ComposeSubQueryKey<ParentKeys, Key>,
> = { _def: DefKey } & {
  [P in keyof Factory]: Factory[P] extends DynamicKey
    ? FactoryOutputCallback<[...DefKey, P], Factory[P]>
    : Factory[P] extends FactoryProperty
    ? FactoryPropertyKey<[...DefKey, P], Factory[P]>
    : never;
};

type FactoryQueryOptionsOutput<
  ParentKeys extends AnyMutableOrReadonlyArray,
  Schema extends QueryFactorySchema,
  SchemaDefKey extends Schema['def'] = Schema['def'],
  QueryFn extends Schema['queryFn'] = Schema['queryFn'],
  Key = ExtractNestedKey<SchemaDefKey>,
  DefKey extends AnyMutableOrReadonlyArray = ComposeSubQueryKey<ParentKeys, Key>,
> = {
  _def: DefKey;
  _ctx: CallbackContext<DefKey, QueryFn>;
};

type AnyMutableOrReadonlyArray = any[] | readonly any[];

type ComposeSubQueryKey<ParentKeys extends AnyMutableOrReadonlyArray, Key> = Key extends ValidValue
  ? readonly [...ParentKeys, Key]
  : readonly [...ParentKeys];

type FactoryQueryOptionsWithNestedKeysOutput<
  ParentKeys extends AnyMutableOrReadonlyArray,
  Schema extends QueryFactoryWithQueriesSchema,
  SchemaDefKey extends Schema['def'] = Schema['def'],
  QueryFn extends Schema['queryFn'] = Schema['queryFn'],
  Factory extends Schema['queries'] = Schema['queries'],
  Key = ExtractNestedKey<SchemaDefKey>,
  DefKey extends AnyMutableOrReadonlyArray = ComposeSubQueryKey<ParentKeys, Key>,
> = {
  _def: DefKey;
  _ctx: CallbackContext<DefKey, QueryFn>;
} & {
  [P in keyof Factory]: Factory[P] extends DynamicKey
    ? FactoryOutputCallback<[...DefKey, P], Factory[P]>
    : Factory[P] extends FactoryProperty
    ? FactoryPropertyKey<[...DefKey, P], Factory[P]>
    : never;
};

type FactoryOutputCallback<
  Keys extends AnyMutableOrReadonlyArray,
  Callback extends DynamicKey,
  CallbackResult extends ReturnType<Callback> = ReturnType<Callback>,
> = {
  (...args: Parameters<Callback>): CallbackResult extends [...infer TupleResult] | readonly [...infer TupleResult]
    ? readonly [...Keys, ...TupleResult]
    : CallbackResult extends QueryFactoryWithQueriesSchema
    ? FactoryQueryOptionsWithNestedKeysOutput<Keys, CallbackResult>
    : CallbackResult extends QueryFactorySchema
    ? FactoryQueryOptionsOutput<Keys, CallbackResult>
    : CallbackResult extends KeySchemaWithQueries
    ? FactorySubQueriesKeyOutput<Keys, CallbackResult>
    : never;
  _def: readonly [...Keys];
};

export type AnyFactoryOutputCallback = FactoryOutputCallback<[string, ...any[]], DynamicKey>;

type FactoryPropertyKey<Keys extends AnyMutableOrReadonlyArray, Value extends FactoryProperty> = Value extends null
  ? readonly [...Keys]
  : Value extends [...infer Result] | readonly [...infer Result]
  ? readonly [...Keys, ...Result]
  : Value extends QueryFactoryWithQueriesSchema
  ? FactoryQueryOptionsWithNestedKeysOutput<Keys, Value>
  : Value extends QueryFactorySchema
  ? FactoryQueryOptionsOutput<Keys, Value>
  : Value extends KeySchemaWithQueries
  ? FactorySubQueriesKeyOutput<Keys, Value>
  : never;

type FactoryOutput<Key extends string, Schema extends FactorySchema> = {
  [P in keyof Schema]: Schema[P] extends DynamicKey
    ? FactoryOutputCallback<[Key, P], Schema[P]>
    : Schema[P] extends FactoryProperty
    ? FactoryPropertyKey<[Key, P], Schema[P]>
    : never;
};

export type DefinitionKey<Key extends string> = {
  _def: readonly [Key];
};

export type QueryKeyFactoryResult<Key extends string, Schema extends FactorySchema> = DefinitionKey<Key> &
  FactoryOutput<Key, Schema>;

export type AnyQueryKeyFactoryResult = DefinitionKey<string> | QueryKeyFactoryResult<string, any>;

export type inferQueryKeys<Schema extends AnyQueryKeyFactoryResult> = {
  [P in keyof Schema]: Schema[P] extends (...args: any[]) => readonly any[] ? ReturnType<Schema[P]> : Schema[P];
};

export type StoreFromMergedQueryKeys<
  QueryKeyFactoryResults extends AnyQueryKeyFactoryResult[],
  Index extends number = 0,
> = QueryKeyFactoryResults[Index] extends null | undefined
  ? {}
  : {
      [P in QueryKeyFactoryResults[Index]['_def'][0]]: QueryKeyFactoryResults[Index];
    } & StoreFromMergedQueryKeys<QueryKeyFactoryResults, Add<Index, 1>>;

export type QueryKeyStoreSchema = Record<string, null | FactorySchema>;

export type QueryKeyStore<StoreSchema extends QueryKeyStoreSchema> = {
  [P in keyof StoreSchema]: StoreSchema[P] extends FactorySchema
    ? QueryKeyFactoryResult<string & P, StoreSchema[P]>
    : DefinitionKey<string & P>;
};

export type inferQueryKeyStore<Store extends QueryKeyStore<any>> = {
  [P in keyof Store]: inferQueryKeys<Store[P]>;
};
