import { createQueries } from './create-queries';
import { type QueryOptionsWithoutInitialDataResult } from './create-query-options';
import { type Prettify, type QueryDefTag } from './internals';

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

describe('create-queries', () => {
  describe('static query', () => {
    it('returns everything', () => {
      const result = createQueries('users', ({ queryOptions }) => ({
        list: queryOptions({
          queryKey: [],
          queryFn: () => [] as User[],
        }),
      }));

      expect(result).toEqual({
        $def: {
          queryKey: [{ $query: ['users'] }],
        },
        list: {
          queryKey: [{ $query: ['users', 'list'] }],
          queryFn: expect.any(Function),
        },
      });

      expectTypeOf(result).toEqualTypeOf<
        Prettify<
          {
            $def: {
              queryKey: readonly [{ $query: ['users'] }];
            };
            list: QueryOptionsWithoutInitialDataResult<User[], User[], readonly [{ $query: ['users', 'list'] }]>;
          } & QueryDefTag
        >
      >();
    });
  });

  describe('dynamic query', () => {
    it('returns everything', () => {
      const result = createQueries('users', ({ queryOptions }) => ({
        detail: (userId: string) =>
          queryOptions({
            queryKey: [{ userId }],
            queryFn: (ctx) => ({ id: ctx.queryKey[0].userId }) as User,
          }),
      }));

      expect(result).toEqual({
        $def: {
          queryKey: [{ $query: ['users'] }],
        },
        detail: expect.any(Function),
      });

      expect(result.detail('user_123')).toEqual({
        queryKey: [{ $query: ['users', 'detail'], userId: 'user_123' }],
        queryFn: expect.any(Function),
      });

      expectTypeOf(result).toEqualTypeOf<
        Prettify<
          {
            $def: {
              queryKey: readonly [{ $query: ['users'] }];
            };
            detail: (
              userId: string,
            ) => QueryOptionsWithoutInitialDataResult<
              User,
              User,
              readonly [{ $query: ['users', 'detail']; userId: string }]
            >;
          } & QueryDefTag
        >
      >();
    });
  });
});
