/** @internal */
export type Prettify<T extends object> = {
  [K in keyof T]: T[K];
} & {};

/** @internal */
declare const factorySymbol: unique symbol;
/** @internal */
export interface FactoryTag {
  [factorySymbol]: symbol;
}

/** @internal */
declare const queryDefSymbol: unique symbol;
/** @internal */
export interface QueryDefTag {
  [queryDefSymbol]: symbol;
}
