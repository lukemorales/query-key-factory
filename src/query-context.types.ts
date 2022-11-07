export type QueryKey = readonly unknown[];

/**
 * @internal use QueryFunction from "@tanstack/query-core" instead
 */
export type QueryFunction<T = unknown, TQueryKey extends QueryKey = QueryKey> = (
  context?: QueryFunctionContext<TQueryKey>,
) => T | Promise<T>;

/**
 * @internal use QueryFunctionContext from "@tanstack/query-core" instead
 */
export type QueryFunctionContext<TQueryKey extends QueryKey = QueryKey, TPageParam = any> = {
  queryKey: TQueryKey;
  signal?: AbortSignal;
  pageParam?: TPageParam;
  meta: QueryMeta | undefined;
};

type QueryMeta = Record<string, unknown>;
