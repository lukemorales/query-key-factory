/* eslint-disable @typescript-eslint/no-explicit-any */
import { Add } from './types.utils';

type AnyObject = Record<string, unknown>;

export type KeyScopeTuple = [KeyScopeValue | undefined, ...Array<KeyScopeValue | undefined>];

type FactoryCallback = (...args: any[]) => KeyScopeValue | KeyScopeTuple;

export type KeyScopeValue = string | number | boolean | AnyObject;

type FactoryProperty = Exclude<KeyScopeValue, AnyObject> | null | FactoryCallback;

export type FactoryObject = Record<string, FactoryProperty>;

type ValidateSchema<Schema extends FactoryObject> = Omit<Schema, 'default'>;

export type ValidateFactory<Schema extends FactoryObject> = Schema extends {
  ['default']: Schema['default'];
}
  ? ValidateSchema<Schema>
  : Schema;

export type FactoryOutputCallback<
  Key,
  Property,
  Callback extends FactoryCallback,
  CallbackResult extends ReturnType<Callback> = ReturnType<Callback>,
> = {
  (...args: Parameters<Callback>): CallbackResult extends [...infer TupleResult]
    ? readonly [Key, Property, ...TupleResult]
    : CallbackResult extends AnyObject
    ? readonly [
        Key,
        Property,
        {
          [SubKey in keyof CallbackResult]: CallbackResult[SubKey];
        },
      ]
    : readonly [Key, Property, CallbackResult];
  toScope: () => readonly [Key, Property];
};

export type FactoryOutput<Key extends string, FactorySchema extends FactoryObject> = {
  [P in keyof FactorySchema]: FactorySchema[P] extends FactoryCallback
    ? FactoryOutputCallback<Key, P, FactorySchema[P]>
    : FactorySchema[P] extends null
    ? readonly [Key, P]
    : readonly [Key, P, FactorySchema[P]];
};

export type DefaultKey<Key extends string> = Record<'default', readonly [Key]>;

export type QueryKeyFactoryResult<Key extends string, FactorySchema extends FactoryObject> = DefaultKey<Key> &
  FactoryOutput<Key, FactorySchema>;

export type AnyQueryKeyFactoryResult = DefaultKey<string> | QueryKeyFactoryResult<string, any>;

export type inferQueryKeys<FactorySchema extends AnyQueryKeyFactoryResult> = {
  [P in keyof FactorySchema]: FactorySchema[P] extends (...args: any[]) => readonly any[]
    ? ReturnType<FactorySchema[P]>
    : FactorySchema[P];
};

export type StoreFromMergedQueryKeys<
  QueryKeyFactoryResults extends AnyQueryKeyFactoryResult[],
  Index extends number = 0,
> = QueryKeyFactoryResults[Index] extends null | undefined
  ? {}
  : {
      [P in QueryKeyFactoryResults[Index]['default'][0]]: QueryKeyFactoryResults[Index];
    } & StoreFromMergedQueryKeys<QueryKeyFactoryResults, Add<Index, 1>>;

/**
 * @deprecated This type will be removed on the next major release, please use `inferMergedStore` instead
 */
export type inferMergedFactory<Schema extends StoreFromMergedQueryKeys<[]>> = {
  [P in keyof Schema]: Schema[P] extends AnyQueryKeyFactoryResult ? inferQueryKeys<Schema[P]> : {};
};

export type inferMergedStore<MergedStoreSchema extends StoreFromMergedQueryKeys<[]>> = {
  [P in keyof MergedStoreSchema]: MergedStoreSchema[P] extends AnyQueryKeyFactoryResult
    ? inferQueryKeys<MergedStoreSchema[P]>
    : {};
};

export type QueryKeyStoreSchema = Record<string, null | FactoryObject>;

export type QueryKeyStore<StoreSchema extends QueryKeyStoreSchema> = {
  [P in keyof StoreSchema]: StoreSchema[P] extends FactoryObject
    ? QueryKeyFactoryResult<`${string & P}`, StoreSchema[P]>
    : DefaultKey<`${string & P}`>;
};

export type inferQueryKeyStore<Store extends QueryKeyStore<any>> = {
  [P in keyof Store]: inferQueryKeys<Store[P]>;
};
