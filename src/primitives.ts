import { type FactoryTag } from './internals';

export type AnyTuple = readonly [unknown, ...unknown[]];

export type RecordTuple = readonly [Record<string, unknown>];

export type EmptyKey = readonly [];

export type WorkableKey = RecordTuple | EmptyKey;

export type FactoryOptions<T> = T & FactoryTag;
