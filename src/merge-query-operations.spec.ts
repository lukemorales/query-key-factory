import { type InfiniteData } from '@tanstack/query-core';

import { defineQueryOperations } from './define-query-operations';
import { mergeQueryOperations } from './merge-query-operations';
import type {
  InfiniteQueryOptionsWithoutInitialData,
  QueryOptionsWithoutInitialData,
} from './options';

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface Team {
  id: string;
  name?: string;
}

interface Organization {
  id: string;
  name?: string;
}

interface ListResponse<T> {
  data: T[];
  metadata: {
    before: string | null;
    after: string | null;
  };
}

describe('mergeQueryOperations', () => {
  const usersOperations = defineQueryOperations('users', (factory) =>
    factory.queryWithArgs('profile', (userId: string) => ({
      queryKey: [{ userId }],
      queryFn: () => Promise.resolve<User>({ id: userId }),
    })),
  );

  const teamsOperations = defineQueryOperations('teams', (factory) =>
    factory.query('all', {
      queryFn: () => Promise.resolve<Team[]>([]),
    }),
  );

  const organizationsOperations = defineQueryOperations(
    'organizations',
    (factory) =>
      factory.infiniteQuery('list', {
        queryFn: () =>
          Promise.resolve<ListResponse<Organization>>({
            data: [],
            metadata: { before: null, after: null },
          }),
        getNextPageParam: (lastPage) => lastPage.metadata.before,
        initialPageParam: '',
      }),
  );

  it('merges the factories and creates a single store', () => {
    const store = mergeQueryOperations(
      usersOperations,
      teamsOperations,
      organizationsOperations,
    );

    expect(store).toEqual({
      users: {
        $baseQueryKey: ['users'],
        profile: expect.any(Function),
      },
      teams: {
        $baseQueryKey: ['teams'],
        all: {
          queryKey: ['teams', 'all'],
          queryFn: expect.any(Function),
        },
      },
      organizations: {
        $baseQueryKey: ['organizations'],
        list: {
          queryKey: ['organizations', 'list'],
          queryFn: expect.any(Function),
          getNextPageParam: expect.any(Function),
          initialPageParam: '',
        },
      },
    });

    expectTypeOf(store).toEqualTypeOf<{
      users: {
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
      };
      teams: {
        $baseQueryKey: readonly ['teams'];
        all: QueryOptionsWithoutInitialData<
          Team[],
          Team[],
          readonly ['teams', 'all']
        >;
      };
      organizations: {
        $baseQueryKey: readonly ['organizations'];
        list: InfiniteQueryOptionsWithoutInitialData<
          ListResponse<Organization>,
          InfiniteData<ListResponse<Organization>, string>,
          readonly ['organizations', 'list'],
          string
        >;
      };
    }>();
  });
});
