/* eslint-disable @typescript-eslint/no-explicit-any */

// See https://github.com/Microsoft/TypeScript/issues/26223#issuecomment-674514787 for original types
type BuildPowersOf2LengthArrays<N extends number, R extends never[][]> = R[0][N] extends never
  ? R
  : BuildPowersOf2LengthArrays<N, [[...R[0], ...R[0]], ...R]>;

type ConcatLargestUntilDone<N extends number, R extends never[][], B extends never[]> = B['length'] extends N
  ? B
  : [...R[0], ...B][N] extends never
  ? ConcatLargestUntilDone<N, R extends [R[0], ...infer U] ? (U extends never[][] ? U : never) : never, B>
  : ConcatLargestUntilDone<
      N,
      R extends [R[0], ...infer U] ? (U extends never[][] ? U : never) : never,
      [...R[0], ...B]
    >;

type Replace<R extends any[], T> = { [K in keyof R]: T };

type TupleOf<T, N extends number> = number extends N
  ? T[]
  : {
      [K in N]: BuildPowersOf2LengthArrays<K, [[never]]> extends infer U
        ? U extends never[][]
          ? Replace<ConcatLargestUntilDone<K, U, []>, T>
          : never
        : never;
    }[N];

type Length<T extends any[]> = T extends { length: infer L } ? L : never;

export type Add<A extends number, B extends number> = Length<[...TupleOf<any, A>, ...TupleOf<any, B>]>;
