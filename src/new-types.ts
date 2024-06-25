/** @internal */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type OmitQueryKey<T extends AnyObject> = Omit<T, 'queryKey'>;

export type BaseOptions<T extends AnyObject> = OmitQueryKey<WithRequired<T, 'queryFn'>>;

export type WithRequired<TTarget, TKey extends keyof TTarget> = TTarget & {
  [_ in TKey]: {};
};

export type AnyObject = Record<string, any>;

export type AnyTuple = readonly [unknown, ...unknown[]];

export type RecordTuple = readonly [AnyObject];

export type EmptyKey = readonly [];

export type WorkableKey = AnyTuple | EmptyKey;
