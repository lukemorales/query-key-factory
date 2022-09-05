import { createQueryKeys } from './create-query-keys';
import { mergeQueryKeys } from './merge-query-keys';

describe('mergeQueryKeys', () => {
  const performSetup = () => {
    const usersKeys = createQueryKeys('users');
    const todosKeys = createQueryKeys('todos', {
      done: null,
      todo: (id: string) => id,
    });

    return { usersKeys, todosKeys };
  };

  it('merges the keys into a single factory object using their default keys as the object properties', () => {
    const { usersKeys, todosKeys } = performSetup();

    const keysFactory = mergeQueryKeys(usersKeys, todosKeys);

    expect(keysFactory).toHaveProperty('users');
    expect(keysFactory).toHaveProperty('todos');

    expect(keysFactory).toMatchObject({
      users: usersKeys,
      todos: todosKeys,
    });
  });
});
