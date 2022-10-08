/**
 * Utils for asserting type expectation in tests
 *
 * @see {@link https://github.com/total-typescript/beginners-typescript-tutorial/blob/main/src/helpers/type-utils.ts for original types}
 */
type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {
      /**
       * @summary Assert type expectations.
       *
       * @description
       * Assert that the received variable has the expected type.
       * Note that this function expectation will never fail at runtime,
       * it can only fail in type land.
       */
      toHaveType<Y extends Equal<T, Y> extends true ? T : never>(): void;
    }
  }
}

export default expect.extend({
  toHaveType<T extends true>(received: any) {
    return {
      pass: true as Expect<T>,
      message: () => `${received} does not match the types`,
    };
  },
});
