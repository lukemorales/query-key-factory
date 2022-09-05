import { createQueryKeyStore } from './create-query-key-store';

describe('createQueryKeyStore', () => {
  it('creates a store from the schema provided as argument', () => {
    const store = createQueryKeyStore({
      users: null,
      todos: {
        done: null,
        todo: (id: string) => id,
      },
    });

    expect(Object.keys(store)).toHaveLength(2);

    expect(store).toHaveProperty('users');
    expect(store).toHaveProperty('todos');

    expect(store).toMatchObject({
      users: {
        default: ['users'],
      },
      todos: {
        default: ['todos'],
        done: ['todos', 'done'],
        todo: expect.any(Function),
      },
    });
  });
});
