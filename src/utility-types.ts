import type { UseQueryOptions } from '@tanstack/react-query';
import type { QueryKeyStore } from './create-query-key-store';
import type {
  AnyFactoryOutputCallback,
  AnyQueryKeyFactoryResult,
  QueryOptionsStruct,
  StaticFactoryOutput,
} from './create-query-keys.types';
import type {
  StaticMutationFactoryOutput,
  AnyMutationFactoryOutputCallback,
  AnyMutationKeyFactoryResult,
} from './create-mutation-keys.types';
import type { AnyMutableOrReadonlyArray } from './types';

type MergeInsertions<T> = T extends object ? { [K in keyof T]: MergeInsertions<T[K]> } : T;

type inferRecordMutationKeys<Target extends object> = {
  [P in Exclude<keyof Target, 'mutationFn'>]: Target[P] extends AnyMutableOrReadonlyArray
    ? Target[P]
    : Target[P] extends object
    ? {
        [K in keyof Target[P]]: inferSchemaProperty<Target[P][K]>;
      }
    : never;
};

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
  : Value extends StaticMutationFactoryOutput<any[], any>
  ? inferRecordMutationKeys<Value>
  : Value extends AnyFactoryOutputCallback
  ? Record<'_def', Value['_def']> & inferRecordQueryKeys<ReturnType<Value>>
  : Value extends AnyMutationFactoryOutputCallback
  ? Record<'_def', Value['_def']> & inferRecordMutationKeys<ReturnType<Value>>
  : never;

export type inferQueryKeys<Schema extends AnyQueryKeyFactoryResult | AnyMutationKeyFactoryResult> = {
  [P in keyof Schema]: MergeInsertions<inferSchemaProperty<Schema[P]>>;
};

export type inferQueryKeyStore<Store extends QueryKeyStore<any>> = {
  [P in keyof Store]: inferQueryKeys<Store[P]>;
};

export type TypedUseQueryOptions<
  Options extends QueryOptionsStruct<any, any>,
  Data = Awaited<ReturnType<Options['queryFn']>>,
> = UseQueryOptions<Awaited<ReturnType<Options['queryFn']>>, unknown, Data, Options['queryKey']>;
