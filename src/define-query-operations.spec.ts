import type { InfiniteData } from '@tanstack/query-core';

import { defineQueryOperations } from './define-query-operations';
import type {
  InfiniteQueryOptionsWithInitialData,
  InfiniteQueryOptionsWithoutInitialData,
  MutationOptions,
  QueryOptionsWithInitialData,
  QueryOptionsWithoutInitialData,
} from './options';

interface User {
  id?: string;
  email?: string;
}

interface Organization {
  id?: string;
  name?: string;
}

interface ListResponse<T> {
  data: T[];
  metadata: {
    before: string | null;
    after: string | null;
  };
}

describe('defineQueryOperations', () => {
  describe('when no procedures are defined', () => {
    it('returns an object with the $baseQueryKey', () => {
      const result = defineQueryOperations('users');

      expect(result).toEqual({
        $baseQueryKey: ['users'],
      });

      expectTypeOf(result).toEqualTypeOf<{
        $baseQueryKey: readonly ['users'];
      }>();
    });
  });

  describe('query', () => {
    describe('without initialData', () => {
      it('returns the queryOptions object with an auto-generated queryKey', () => {
        const result = defineQueryOperations('users', (operations) =>
          operations.query('list', {
            queryFn: () => Promise.resolve<User>({}),
          }),
        );

        expect(result).toEqual({
          $baseQueryKey: ['users'],
          list: {
            queryKey: ['users', 'list'],
            queryFn: expect.any(Function),
          },
        });

        expectTypeOf(result).toEqualTypeOf<{
          $baseQueryKey: readonly ['users'];
          list: QueryOptionsWithoutInitialData<
            User,
            User,
            readonly ['users', 'list']
          >;
        }>();
      });

      describe('when data is transformed with `select`', () => {
        it('returns the queryOptions object with an auto-generated queryKey and the correct type', () => {
          const result = defineQueryOperations('users', (operations) =>
            operations.query('list', {
              queryFn: () => Promise.resolve<User>({}),
              select(data) {
                return data.id;
              },
            }),
          );

          expect(result).toEqual({
            $baseQueryKey: ['users'],
            list: {
              queryKey: ['users', 'list'],
              queryFn: expect.any(Function),
              select: expect.any(Function),
            },
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['users'];
            list: QueryOptionsWithoutInitialData<
              User,
              string | undefined,
              readonly ['users', 'list']
            >;
          }>();
        });
      });
    });

    describe('with initialData', () => {
      it('returns the queryOptions object with an auto-generated queryKey', () => {
        const result = defineQueryOperations('users', (operations) =>
          operations.query('list', {
            queryFn: () => Promise.resolve<User>({}),
            initialData: {
              id: 'user_00',
            },
          }),
        );

        expect(result).toEqual({
          $baseQueryKey: ['users'],
          list: {
            queryKey: ['users', 'list'],
            queryFn: expect.any(Function),
            initialData: { id: 'user_00' },
          },
        });

        expectTypeOf(result).toEqualTypeOf<{
          $baseQueryKey: readonly ['users'];
          list: QueryOptionsWithInitialData<
            User,
            User,
            readonly ['users', 'list']
          >;
        }>();
      });

      describe('when data is transformed with `select`', () => {
        it('returns the queryOptions object with an auto-generated queryKey and the correct type', () => {
          const result = defineQueryOperations('users', (operations) =>
            operations.query('list', {
              queryFn: () => Promise.resolve<User>({}),
              select(data) {
                return data.id;
              },
              initialData: {
                id: 'user_00',
              },
            }),
          );

          expect(result).toEqual({
            $baseQueryKey: ['users'],
            list: {
              queryKey: ['users', 'list'],
              queryFn: expect.any(Function),
              select: expect.any(Function),
              initialData: { id: 'user_00' },
            },
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['users'];
            list: QueryOptionsWithInitialData<
              User,
              string | undefined,
              readonly ['users', 'list']
            >;
          }>();
        });
      });
    });
  });

  describe('queryWithArgs', () => {
    describe('without initialData', () => {
      it('returns the queryOptions object with an auto-generated queryKey', () => {
        const result = defineQueryOperations('users', (operations) =>
          operations.queryWithArgs('profile', (userId: string) => ({
            queryKey: [{ userId }],
            queryFn: () => Promise.resolve<User>({ id: userId }),
          })),
        );

        expect(result).toEqual({
          $baseQueryKey: ['users'],
          profile: expect.any(Function),
        });

        expect(result.profile.$baseQueryKey).toEqual(['users', 'profile']);

        expect(result.profile('user_01')).toEqual({
          queryKey: ['users', 'profile', { userId: 'user_01' }],
          queryFn: expect.any(Function),
        });

        expectTypeOf(result).toEqualTypeOf<{
          $baseQueryKey: readonly ['users'];
          profile: {
            $baseQueryKey: readonly ['users', 'profile'];
            (
              userId: string,
            ): QueryOptionsWithoutInitialData<
              User,
              User,
              readonly ['users', 'profile', { userId: string }]
            >;
          };
        }>();
      });

      describe('when data is transformed with `select`', () => {
        it('returns the queryOptions object with an auto-generated queryKey and the correct type', () => {
          const result = defineQueryOperations('users', (operations) =>
            operations.queryWithArgs('profile', (userId: string) => ({
              queryKey: [{ userId }],
              queryFn: () => Promise.resolve<User>({ id: userId }),
              select(data) {
                return data.id;
              },
            })),
          );

          expect(result.profile.$baseQueryKey).toEqual(['users', 'profile']);

          expect(result.profile('user_01')).toEqual({
            queryKey: ['users', 'profile', { userId: 'user_01' }],
            queryFn: expect.any(Function),
            select: expect.any(Function),
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['users'];
            profile: {
              $baseQueryKey: readonly ['users', 'profile'];
              (
                userId: string,
              ): QueryOptionsWithoutInitialData<
                User,
                string | undefined,
                readonly ['users', 'profile', { userId: string }]
              >;
            };
          }>();
        });
      });
    });

    describe('with initialData', () => {
      it('returns the queryOptions object with an auto-generated queryKey', () => {
        const result = defineQueryOperations('users', (operations) =>
          operations.queryWithArgs('profile', (userId: string) => ({
            queryKey: [{ userId }],
            queryFn: () => Promise.resolve<User>({}),
            initialData: {
              id: 'user_00',
            },
          })),
        );

        expect(result).toEqual({
          $baseQueryKey: ['users'],
          profile: expect.any(Function),
        });

        expect(result.profile.$baseQueryKey).toEqual(['users', 'profile']);

        expect(result.profile('user_01')).toEqual({
          queryKey: ['users', 'profile', { userId: 'user_01' }],
          queryFn: expect.any(Function),
          initialData: { id: 'user_00' },
        });

        expectTypeOf(result).toEqualTypeOf<{
          $baseQueryKey: readonly ['users'];
          profile: {
            $baseQueryKey: readonly ['users', 'profile'];
            (
              userId: string,
            ): QueryOptionsWithInitialData<
              User,
              User,
              readonly ['users', 'profile', { userId: string }]
            >;
          };
        }>();
      });

      describe('when data is transformed with `select`', () => {
        it('returns the queryOptions object with an auto-generated queryKey and the correct type', () => {
          const result = defineQueryOperations('users', (operations) =>
            operations.queryWithArgs('profile', (userId: string) => ({
              queryKey: [{ userId }],
              queryFn: () => Promise.resolve<User>({}),
              select(data) {
                return data.id;
              },
              initialData: {
                id: 'user_00',
              },
            })),
          );

          expect(result.profile.$baseQueryKey).toEqual(['users', 'profile']);

          expect(result.profile('user_01')).toEqual({
            queryKey: ['users', 'profile', { userId: 'user_01' }],
            queryFn: expect.any(Function),
            select: expect.any(Function),
            initialData: { id: 'user_00' },
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['users'];
            profile: {
              $baseQueryKey: readonly ['users', 'profile'];
              (
                userId: string,
              ): QueryOptionsWithInitialData<
                User,
                string | undefined,
                readonly ['users', 'profile', { userId: string }]
              >;
            };
          }>();
        });
      });
    });

    describe('with context', () => {
      describe('without initialData', () => {
        it('returns the queryOptions object with an auto-generated queryKey', () => {
          const result = defineQueryOperations('users', (operations) =>
            operations.queryWithArgs(
              'profile',
              (userId: string) => ({
                queryKey: [{ userId }],
                queryFn: () => Promise.resolve<User>({ id: userId }),
              }),
              (context) => {
                expect(context.args).toEqual({
                  userId: expect.any(String),
                });

                return context.query('organizations', {
                  queryFn: () => Promise.resolve<Organization[]>([]),
                });
              },
            ),
          );

          expect(result).toEqual({
            $baseQueryKey: ['users'],
            profile: expect.any(Function),
          });

          expect(result.profile.$baseQueryKey).toEqual(['users', 'profile']);

          expect(result.profile('user_01')).toEqual({
            queryKey: ['users', 'profile', { userId: 'user_01' }],
            queryFn: expect.any(Function),
            $ctx: {
              organizations: {
                queryKey: [
                  'users',
                  'profile',
                  { userId: 'user_01' },
                  'organizations',
                ],
                queryFn: expect.any(Function),
              },
            },
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['users'];
            profile: {
              $baseQueryKey: readonly ['users', 'profile'];
              (userId: string): QueryOptionsWithoutInitialData<
                User,
                User,
                readonly ['users', 'profile', { userId: string }]
              > & {
                $ctx: {
                  organizations: QueryOptionsWithoutInitialData<
                    Organization[],
                    Organization[],
                    readonly [
                      'users',
                      'profile',
                      { userId: string },
                      'organizations',
                    ]
                  >;
                };
              };
            };
          }>();
        });

        describe('when data is transformed with `select`', () => {
          it('returns the queryOptions object with an auto-generated queryKey and the correct type', () => {
            const result = defineQueryOperations('users', (operations) =>
              operations.queryWithArgs('profile', (userId: string) => ({
                queryKey: [{ userId }],
                queryFn: () => Promise.resolve<User>({ id: userId }),
                select(data) {
                  return data.id;
                },
              })),
            );

            expect(result.profile.$baseQueryKey).toEqual(['users', 'profile']);

            expect(result.profile('user_01')).toEqual({
              queryKey: ['users', 'profile', { userId: 'user_01' }],
              queryFn: expect.any(Function),
              select: expect.any(Function),
            });

            expectTypeOf(result).toEqualTypeOf<{
              $baseQueryKey: readonly ['users'];
              profile: {
                $baseQueryKey: readonly ['users', 'profile'];
                (
                  userId: string,
                ): QueryOptionsWithoutInitialData<
                  User,
                  string | undefined,
                  readonly ['users', 'profile', { userId: string }]
                >;
              };
            }>();
          });
        });
      });

      describe('with initialData', () => {
        it('returns the queryOptions object with an auto-generated queryKey', () => {
          const result = defineQueryOperations('users', (operations) =>
            operations.queryWithArgs('profile', (userId: string) => ({
              queryKey: [{ userId }],
              queryFn: () => Promise.resolve<User>({}),
              initialData: {
                id: 'user_00',
              },
            })),
          );

          expect(result).toEqual({
            $baseQueryKey: ['users'],
            profile: expect.any(Function),
          });

          expect(result.profile('user_01')).toEqual({
            queryKey: ['users', 'profile', { userId: 'user_01' }],
            queryFn: expect.any(Function),
            initialData: { id: 'user_00' },
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['users'];
            profile: {
              $baseQueryKey: readonly ['users', 'profile'];
              (
                userId: string,
              ): QueryOptionsWithInitialData<
                User,
                User,
                readonly ['users', 'profile', { userId: string }]
              >;
            };
          }>();
        });

        describe('when data is transformed with `select`', () => {
          it('returns the queryOptions object with an auto-generated queryKey and the correct type', () => {
            const result = defineQueryOperations('users', (operations) =>
              operations.queryWithArgs('profile', (userId: string) => ({
                queryKey: [{ userId }],
                queryFn: () => Promise.resolve<User>({}),
                select(data) {
                  return data.id;
                },
                initialData: {
                  id: 'user_00',
                },
              })),
            );

            expect(result.profile('user_01')).toEqual({
              queryKey: ['users', 'profile', { userId: 'user_01' }],
              queryFn: expect.any(Function),
              select: expect.any(Function),
              initialData: { id: 'user_00' },
            });

            expectTypeOf(result).toEqualTypeOf<{
              $baseQueryKey: readonly ['users'];
              profile: {
                $baseQueryKey: readonly ['users', 'profile'];
                (
                  userId: string,
                ): QueryOptionsWithInitialData<
                  User,
                  string | undefined,
                  readonly ['users', 'profile', { userId: string }]
                >;
              };
            }>();
          });
        });
      });
    });
  });

  describe('mutation', () => {
    it('returns the mutationOptions object with an auto-generated mutationKey', () => {
      interface Options {
        name: string;
        email: string;
      }

      const result = defineQueryOperations('users', (operations) =>
        operations.mutation('create', (queryClient) => ({
          mutationFn: (_: Options) => Promise.resolve(true),
          onMutate(variables: Options) {
            console.log(variables);
          },
          onSuccess(data: boolean, variables, context) {},
        })),
      );

      expect(result).toEqual({
        $baseQueryKey: ['users'],
        create: {
          mutationKey: ['users', 'create'],
          mutationFn: expect.any(Function),
        },
      });

      expectTypeOf(result).toEqualTypeOf<{
        $baseQueryKey: readonly ['users'];
        create: MutationOptions<
          boolean,
          Options,
          unknown,
          readonly ['users', 'create']
        >;
      }>();
    });
  });

  describe('infiniteQuery', () => {
    function getUsersList(): Promise<ListResponse<User>> {
      return Promise.resolve({
        data: [],
        metadata: { before: null, after: null },
      });
    }

    describe('without initialData', () => {
      it('returns the infiniteQueryOptions object with an auto-generated queryKey', () => {
        const result = defineQueryOperations('users', (operations) =>
          operations.infiniteQuery('connections', {
            queryFn: () => getUsersList(),
            getNextPageParam: (lastPage) => lastPage.metadata.before,
            getPreviousPageParam: (lastPage) => lastPage.metadata.after,
            initialPageParam: '',
          }),
        );

        expect(result).toEqual({
          $baseQueryKey: ['users'],
          connections: {
            queryKey: ['users', 'connections'],
            queryFn: expect.any(Function),
            getNextPageParam: expect.any(Function),
            getPreviousPageParam: expect.any(Function),
            initialPageParam: '',
          },
        });

        expectTypeOf(result).toEqualTypeOf<{
          $baseQueryKey: readonly ['users'];
          connections: InfiniteQueryOptionsWithoutInitialData<
            ListResponse<User>,
            InfiniteData<ListResponse<User>, string>,
            readonly ['users', 'connections'],
            string
          >;
        }>();
      });

      describe('when data is transformed with `select`', () => {
        it('returns the infiniteQueryOptions object with an auto-generated queryKey and the correct type', () => {
          const result = defineQueryOperations('users', (operations) =>
            operations.infiniteQuery('connections', {
              queryFn: () => getUsersList(),
              getNextPageParam: (lastPage) => lastPage.metadata.before,
              getPreviousPageParam: (lastPage) => lastPage.metadata.after,
              initialPageParam: '',
              select(cache) {
                return cache.pages.flatMap(({ data }) => data);
              },
            }),
          );

          expect(result).toEqual({
            $baseQueryKey: ['users'],
            connections: {
              queryKey: ['users', 'connections'],
              queryFn: expect.any(Function),
              getNextPageParam: expect.any(Function),
              getPreviousPageParam: expect.any(Function),
              initialPageParam: '',
              select: expect.any(Function),
            },
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['users'];
            connections: InfiniteQueryOptionsWithoutInitialData<
              ListResponse<User>,
              User[],
              readonly ['users', 'connections'],
              string
            >;
          }>();
        });
      });
    });

    describe('with initialData', () => {
      it('returns the queryOptions object with an auto-generated queryKey', () => {
        const result = defineQueryOperations('users', (operations) =>
          operations.infiniteQuery('connections', {
            queryFn: () => getUsersList(),
            getNextPageParam: (lastPage) => lastPage.metadata.before,
            getPreviousPageParam: (lastPage) => lastPage.metadata.after,
            initialPageParam: '',
            initialData: {
              pages: [],
              pageParams: [],
            },
          }),
        );

        expect(result).toEqual({
          $baseQueryKey: ['users'],
          connections: {
            queryKey: ['users', 'connections'],
            queryFn: expect.any(Function),
            getNextPageParam: expect.any(Function),
            getPreviousPageParam: expect.any(Function),
            initialPageParam: '',
            initialData: {
              pages: [],
              pageParams: [],
            },
          },
        });

        expectTypeOf(result).toEqualTypeOf<{
          $baseQueryKey: readonly ['users'];
          connections: InfiniteQueryOptionsWithInitialData<
            ListResponse<User>,
            InfiniteData<ListResponse<User>, string>,
            readonly ['users', 'connections'],
            string
          >;
        }>();
      });

      describe('when data is transformed with `select`', () => {
        it('returns the queryOptions object with an auto-generated queryKey and the correct type', () => {
          const result = defineQueryOperations('users', (operations) =>
            operations.infiniteQuery('connections', {
              queryFn: () => getUsersList(),
              getNextPageParam: (lastPage) => lastPage.metadata.before,
              getPreviousPageParam: (lastPage) => lastPage.metadata.after,
              initialPageParam: '',
              select(cache) {
                return cache.pages.flatMap(({ data }) => data);
              },
              initialData: {
                pages: [],
                pageParams: [],
              },
            }),
          );

          expect(result).toEqual({
            $baseQueryKey: ['users'],
            connections: {
              queryKey: ['users', 'connections'],
              queryFn: expect.any(Function),
              getNextPageParam: expect.any(Function),
              getPreviousPageParam: expect.any(Function),
              initialPageParam: '',
              select: expect.any(Function),
              initialData: {
                pages: [],
                pageParams: [],
              },
            },
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['users'];
            connections: InfiniteQueryOptionsWithInitialData<
              ListResponse<User>,
              User[],
              readonly ['users', 'connections'],
              string
            >;
          }>();
        });
      });
    });
  });

  describe('infiniteQueryWithArgs', () => {
    type OrganizationListOptions = {
      sort: 'ASC' | 'DESC';
    };

    function getOrganizations(
      _: OrganizationListOptions,
    ): Promise<ListResponse<Organization>> {
      return Promise.resolve({
        data: [],
        metadata: { before: null, after: null },
      });
    }

    describe('without initialData', () => {
      it('returns the infiniteQueryOptions object with an auto-generated queryKey', () => {
        const result = defineQueryOperations('organizations', (operations) =>
          operations.infiniteQueryWithArgs(
            'list',
            (options: OrganizationListOptions) => ({
              queryKey: [options],
              queryFn: (ctx) => getOrganizations(ctx.queryKey[2]),
              getNextPageParam: (lastPage) => lastPage.metadata.before,
              getPreviousPageParam: (lastPage) => lastPage.metadata.after,
              initialPageParam: '',
            }),
          ),
        );

        expect(result).toEqual({
          $baseQueryKey: ['organizations'],
          list: expect.any(Function),
        });

        expect(result.list({ sort: 'ASC' })).toEqual({
          queryKey: ['organizations', 'list', { sort: 'ASC' }],
          queryFn: expect.any(Function),
          getNextPageParam: expect.any(Function),
          getPreviousPageParam: expect.any(Function),
          initialPageParam: '',
        });

        expectTypeOf(result).toEqualTypeOf<{
          $baseQueryKey: readonly ['organizations'];
          list: (
            options: OrganizationListOptions,
          ) => InfiniteQueryOptionsWithoutInitialData<
            ListResponse<Organization>,
            InfiniteData<ListResponse<Organization>, string>,
            readonly ['organizations', 'list', OrganizationListOptions],
            string
          >;
        }>();
      });

      describe('when data is transformed with `select`', () => {
        it('returns the infiniteQueryOptions object with an auto-generated queryKey and the correct type', () => {
          const result = defineQueryOperations('organizations', (operations) =>
            operations.infiniteQueryWithArgs(
              'list',
              (options: OrganizationListOptions) => ({
                queryKey: [options],
                queryFn: (ctx) => getOrganizations(ctx.queryKey[2]),
                getNextPageParam: (lastPage) => lastPage.metadata.before,
                getPreviousPageParam: (lastPage) => lastPage.metadata.after,
                initialPageParam: '',
                select(cache) {
                  return cache.pages.flatMap(({ data }) => data);
                },
              }),
            ),
          );

          expect(result.list({ sort: 'ASC' })).toEqual({
            queryKey: ['organizations', 'list', { sort: 'ASC' }],
            queryFn: expect.any(Function),
            getNextPageParam: expect.any(Function),
            getPreviousPageParam: expect.any(Function),
            initialPageParam: '',
            select: expect.any(Function),
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['organizations'];
            list: (
              options: OrganizationListOptions,
            ) => InfiniteQueryOptionsWithoutInitialData<
              ListResponse<Organization>,
              Organization[],
              readonly ['organizations', 'list', OrganizationListOptions],
              string
            >;
          }>();
        });
      });
    });

    describe('with initialData', () => {
      it('returns the queryOptions object with an auto-generated queryKey', () => {
        const result = defineQueryOperations('organizations', (operations) =>
          operations.infiniteQueryWithArgs(
            'list',
            (options: OrganizationListOptions) => ({
              queryKey: [options],
              queryFn: (ctx) => getOrganizations(ctx.queryKey[2]),
              getNextPageParam: (lastPage) => lastPage.metadata.before,
              getPreviousPageParam: (lastPage) => lastPage.metadata.after,
              initialPageParam: '',
              initialData: {
                pages: [],
                pageParams: [],
              },
            }),
          ),
        );

        expect(result).toEqual({
          $baseQueryKey: ['organizations'],
          list: expect.any(Function),
        });

        expect(result.list({ sort: 'ASC' })).toEqual({
          queryKey: ['organizations', 'list', { sort: 'ASC' }],
          queryFn: expect.any(Function),
          getNextPageParam: expect.any(Function),
          getPreviousPageParam: expect.any(Function),
          initialPageParam: '',
          initialData: {
            pages: [],
            pageParams: [],
          },
        });

        expectTypeOf(result).toEqualTypeOf<{
          $baseQueryKey: readonly ['organizations'];
          list: (
            options: OrganizationListOptions,
          ) => InfiniteQueryOptionsWithInitialData<
            ListResponse<Organization>,
            InfiniteData<ListResponse<Organization>, string>,
            readonly ['organizations', 'list', OrganizationListOptions],
            string
          >;
        }>();
      });

      describe('when data is transformed with `select`', () => {
        it('returns the queryOptions object with an auto-generated queryKey and the correct type', () => {
          const result = defineQueryOperations('organizations', (operations) =>
            operations.infiniteQueryWithArgs(
              'list',
              (options: OrganizationListOptions) => ({
                queryKey: [options],
                queryFn: (ctx) => getOrganizations(ctx.queryKey[2]),
                getNextPageParam: (lastPage) => lastPage.metadata.before,
                getPreviousPageParam: (lastPage) => lastPage.metadata.after,
                initialPageParam: '',
                select(cache) {
                  return cache.pages.flatMap(({ data }) => data);
                },
                initialData: {
                  pages: [],
                  pageParams: [],
                },
              }),
            ),
          );

          expect(result.list({ sort: 'ASC' })).toEqual({
            queryKey: ['organizations', 'list', { sort: 'ASC' }],
            queryFn: expect.any(Function),
            getNextPageParam: expect.any(Function),
            getPreviousPageParam: expect.any(Function),
            initialPageParam: '',
            select: expect.any(Function),
            initialData: {
              pages: [],
              pageParams: [],
            },
          });

          expectTypeOf(result).toEqualTypeOf<{
            $baseQueryKey: readonly ['organizations'];
            list: (
              options: OrganizationListOptions,
            ) => InfiniteQueryOptionsWithInitialData<
              ListResponse<Organization>,
              Organization[],
              readonly ['organizations', 'list', OrganizationListOptions],
              string
            >;
          }>();
        });
      });
    });
  });
});
