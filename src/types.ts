export type AnyMutableOrReadonlyArray = any[] | readonly any[];

export type Tuple = [ValidValue, ...Array<ValidValue | undefined>];

export type KeyTuple = Tuple | Readonly<Tuple>;

export type ValidValue = string | number | boolean | object | bigint;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DefinitionKey<Key extends AnyMutableOrReadonlyArray> = {
  _def: readonly [...Key];
};
