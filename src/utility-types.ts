import type { UseQueryOptions } from '@tanstack/react-query';
import type { QueryKeyStore } from './create-query-key-store';
import type { QueryOptionsStruct, inferQueryKeys } from './create-query-keys.types';

export type { inferQueryKeys } from './create-query-keys.types';

export type TypedUseQueryOptions<
  Options extends QueryOptionsStruct<any, any>,
  Data = Awaited<ReturnType<Options['queryFn']>>,
> = UseQueryOptions<Awaited<ReturnType<Options['queryFn']>>, unknown, Data, Options['queryKey']>;

export type inferQueryKeyStore<Store extends QueryKeyStore<any>> = {
  [P in keyof Store]: inferQueryKeys<Store[P]>;
};
