import { QueryFunction } from '@tanstack/query-core';

import { createQueryKeys } from './create-query-keys';
import { mergeQueryKeys } from './merge-query-keys';
import { inferQueryKeyStore } from './types';

describe('mergeQueryKeys', () => {
  interface Filters {
    preview: boolean;
    status: 'completed' | 'in-progress';
  }

  const performSetup = () => {
    const usersKeys = createQueryKeys('users', {
      me: null,
      detail: (userId: string) => ({
        queryKey: [userId],
        queryFn: () => Promise.resolve({ id: userId }),
        contextQueries: {
          settings: null,
        },
      }),
    });
    const todosKeys = createQueryKeys('todos', {
      detail: (todoId: string) => [todoId],
      list: (filters: Filters) => [{ filters }],
      search: (query: string, limit: number) => [query, limit],
    });

    return { usersKeys, todosKeys };
  };

  it('merges the keys into a single store object using the "_def" values as the properties', () => {
    const { usersKeys, todosKeys } = performSetup();

    const store = mergeQueryKeys(usersKeys, todosKeys);

    expect(store).toHaveProperty('users');
    expect(store).toHaveProperty('todos');

    expect(store).toEqual({
      users: usersKeys,
      todos: todosKeys,
    });

    expect(store).toHaveType<{
      users: {
        _def: readonly ['users'];
        me: {
          queryKey: readonly ['users', 'me'];
        };
        detail: {
          _def: readonly ['users', 'detail'];
        } & ((userId: string) => {
          queryKey: readonly ['users', 'detail', string];
          queryFn: QueryFunction<{ id: string }, readonly ['users', 'detail', string]>;
          _ctx: {
            settings: {
              queryKey: readonly ['users', 'detail', string, 'settings'];
            };
          };
        });
      };
      todos: {
        _def: readonly ['todos'];
        detail: {
          _def: readonly ['todos', 'detail'];
        } & ((todoId: string) => {
          queryKey: readonly ['todos', 'detail', string];
        });
        list: {
          _def: readonly ['todos', 'list'];
        } & ((filters: Filters) => {
          queryKey: readonly ['todos', 'list', { filters: Filters }];
        });
        search: {
          _def: readonly ['todos', 'search'];
        } & ((
          query: string,
          limit: number,
        ) => {
          queryKey: readonly ['todos', 'search', string, number];
        });
      };
    }>();

    expect({} as inferQueryKeyStore<typeof store>).toHaveStrictType<{
      users: {
        _def: readonly ['users'];
        me: {
          queryKey: readonly ['users', 'me'];
        };
        detail: {
          _def: readonly ['users', 'detail'];
          _ctx: {
            settings: {
              queryKey: readonly ['users', 'detail', string, 'settings'];
            };
          };
          queryKey: readonly ['users', 'detail', string];
        };
      };
      todos: {
        _def: readonly ['todos'];
        detail: {
          _def: readonly ['todos', 'detail'];
          queryKey: readonly ['todos', 'detail', string];
        };
        list: {
          _def: readonly ['todos', 'list'];
          queryKey: readonly ['todos', 'list', { filters: Filters }];
        };
        search: {
          _def: readonly ['todos', 'search'];
          queryKey: readonly ['todos', 'search', string, number];
        };
      };
    }>();
  });
});
