import { createQueryKeys } from './create-query-keys';
import { mergeQueryKeys } from './merge-query-keys';

describe('mergeQueryKeys', () => {
  const performSetup = () => {
    interface Filters {
      preview: boolean;
      status: 'completed' | 'in-progress';
    }

    const usersKeys = createQueryKeys('users');
    const todosKeys = createQueryKeys('todos', {
      detail: (todoId: string) => [todoId],
      list: (filters: Filters) => [{ filters }],
      search: (query: string, limit = 15) => [query, limit],
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
  });
});
