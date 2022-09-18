import { Add, ExtractInternalKeys } from './internals';

type AnyObject = Record<string, unknown>;

export type AnyQueryKey = readonly [string, ...any[]];

type Tuple = [ValidValue, ...Array<ValidValue | undefined>];
export type KeyTuple = Tuple | Readonly<Tuple>;

export type ValidValue = string | number | boolean | AnyObject;

type KeyWithArgumentsOrNestedKeys = (...args: any[]) => NestedKeySchema | KeyTuple;

type NestedKeySchema = {
  def: readonly [string | number];
  keys: FactorySchema;
};

type FactoryProperty = null | KeyTuple;

export type FactorySchema = Record<string, FactoryProperty | KeyWithArgumentsOrNestedKeys>;

type ValidateSchema<Schema extends FactorySchema> = Omit<Schema, `_${string}`>;

export type ValidateFactory<Schema extends FactorySchema> = Schema extends {
  [P in ExtractInternalKeys<Schema>]: Schema[P];
}
  ? ValidateSchema<Schema>
  : Schema;

type ExtractNestedKey<Key extends readonly [string | number]> = Key extends [infer Result] ? Result : never;

type FactoryNestedKeyOutput<
  ParentKeys extends any[],
  Schema extends NestedKeySchema,
  DefKey extends Schema['def'] = Schema['def'],
  Factory extends Schema['keys'] = Schema['keys'],
  NestedKey = ExtractNestedKey<DefKey>,
> = Record<'_def', readonly [...ParentKeys, NestedKey]> & {
  [P in keyof Factory]: Factory[P] extends KeyWithArgumentsOrNestedKeys
    ? FactoryOutputCallback<[...ParentKeys, NestedKey, P], Factory[P]>
    : Factory[P] extends FactoryProperty
    ? FactoryPropertyKey<[...ParentKeys, NestedKey, P], Factory[P]>
    : never;
};

type FactoryOutputCallback<
  Keys extends any[],
  Callback extends KeyWithArgumentsOrNestedKeys,
  CallbackResult extends ReturnType<Callback> = ReturnType<Callback>,
> = {
  (...args: Parameters<Callback>): CallbackResult extends [...infer TupleResult]
    ? readonly [...Keys, ...TupleResult]
    : CallbackResult extends readonly [...infer TupleResult]
    ? readonly [...Keys, ...TupleResult]
    : CallbackResult extends NestedKeySchema
    ? FactoryNestedKeyOutput<Keys, CallbackResult>
    : never;
  _def: readonly [...Keys];
};

export type AnyFactoryOutputCallback = FactoryOutputCallback<[string, ...any[]], KeyWithArgumentsOrNestedKeys>;

type FactoryPropertyKey<Keys extends any[], Value extends FactoryProperty> = Value extends null
  ? readonly [...Keys]
  : Value extends [...infer Result]
  ? readonly [...Keys, ...Result]
  : Value extends readonly [...infer Result]
  ? readonly [...Keys, ...Result]
  : never;

type FactoryOutput<Key extends string, Schema extends FactorySchema> = {
  [P in keyof Schema]: Schema[P] extends KeyWithArgumentsOrNestedKeys
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
