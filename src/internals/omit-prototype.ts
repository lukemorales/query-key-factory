/**
 * Create an object without inheriting anything from `Object.prototype`
 * @internal
 *
 * @see {@link https://github.com/trpc/trpc/blob/next/packages/server/src/core/internals/omitPrototype.ts tRPC repo for original code }
 */
export function omitPrototype<T extends Record<string, unknown>>(obj: T): T {
  return Object.assign(Object.create(null), obj);
}
