export type QueryKey = readonly unknown[];

export type QueryFunction<T = unknown, TQueryKey extends QueryKey = QueryKey> = (
  context: QueryFunctionContext<TQueryKey>,
) => T | Promise<T>;

export interface QueryFunctionContext<TQueryKey extends QueryKey = QueryKey, TPageParam = any> {
  queryKey: TQueryKey;
  signal?: AbortSignal;
  pageParam?: TPageParam;
  meta: QueryMeta | undefined;
}

type QueryMeta = Record<string, unknown>;
