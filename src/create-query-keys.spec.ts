import { createQueryKeys } from './create-query-keys';

describe('createQueryKeys', () => {
  describe('when called with only one argument', () => {
    it('creates a store with only "_def" if called with one parameter', () => {
      const queryKeys = createQueryKeys('users');

      expect(queryKeys).toHaveProperty('_def');
      expect(Object.keys(queryKeys)).toHaveLength(1);

      expect(queryKeys).toEqual({
        _def: ['users'],
      });
    });

    it('creates the "_def" query key as an array', () => {
      const queryKeys = createQueryKeys('users');

      expect(Array.isArray(queryKeys._def)).toBeTruthy();
      expect(queryKeys._def).toHaveLength(1);

      expect(queryKeys._def).toEqual(['users']);

      // TODO: delete expectation block on next major release
      // eslint-disable-next-line no-lone-blocks
      {
        expect(Array.isArray(queryKeys.default)).toBeTruthy();

        expect(queryKeys.default).toHaveLength(1);
        expect(queryKeys.default).toEqual(['users']);
      }
    });
  });

  describe('when called with the key and the factory schema', () => {
    it('throws an error if the factory schema contains a key that starts with "_"', () => {
      expect(() =>
        createQueryKeys('users', {
          // @ts-expect-error: "_def" should not be an allowed key
          _def: 'trying to override the _def key value',
          role: 'admin',
        }),
      ).toThrow('Keys that start with "_" are reserved for the query key factory');

      // TODO: delete expectation block on next major release
      // eslint-disable-next-line no-lone-blocks
      {
        expect(() =>
          createQueryKeys('users', {
            // @ts-expect-error: "default" should not be an allowed key
            default: 'trying to override the default key value',
            role: 'admin',
          }),
        ).toThrow('"default" is a key reserved for the query key factory');
      }
    });

    it('creates a store that contains the "_def" key and the schema', () => {
      const queryKeys = createQueryKeys('todos', {
        status: 'open',
        priority: 'high',
      });

      expect(queryKeys).toHaveProperty('_def');
      expect(queryKeys).toHaveProperty('status');
      expect(queryKeys).toHaveProperty('priority');

      expect(queryKeys).toMatchObject({
        _def: ['todos'],
        status: ['todos', 'status', 'open'],
        priority: ['todos', 'priority', 'high'],
      });
    });

    describe('when the schema property is not a function', () => {
      it('creates an array in the shape [key, schema.property] if the value is NULL', () => {
        const queryKeys = createQueryKeys('users', {
          me: null,
        });

        expect(queryKeys.me).toHaveLength(2);
        expect(queryKeys.me).toEqual(['users', 'me']);
      });

      it('creates an array in the shape [key, schema.property, value] if the value is not NULL', () => {
        const queryKeys = createQueryKeys('users', {
          role: 'admin',
        });

        expect(queryKeys.role).toHaveLength(3);

        expect(queryKeys.role).toEqual(['users', 'role', 'admin']);
      });
    });

    describe('when the schema property is a function', () => {
      describe('when the function returns a primitive', () => {
        it('creates a callback that returns a formatted query key', () => {
          const queryKeys = createQueryKeys('todos', {
            todo: (id: string) => id,
          });

          expect(typeof queryKeys.todo).toBe('function');

          const result = queryKeys.todo('todo-id');

          expect(Array.isArray(result)).toBeTruthy();
          expect(result).toHaveLength(3);
          expect(result).toEqual(['todos', 'todo', 'todo-id']);
        });
      });

      describe('when the function returns an object', () => {
        it('creates a callback that returns a formatted query key', () => {
          const queryKeys = createQueryKeys('todos', {
            todo: (id: string, preview: boolean) => ({ id, preview }),
          });

          expect(typeof queryKeys.todo).toBe('function');

          const generatedKey = queryKeys.todo('todo-id', true);

          expect(Array.isArray(generatedKey)).toBeTruthy();
          expect(generatedKey).toHaveLength(3);
          expect(generatedKey).toEqual(['todos', 'todo', { id: 'todo-id', preview: true }]);
        });
      });

      describe('when the function returns a tuple', () => {
        interface Options {
          id: string;
          preview: boolean;
          status: 'completed' | 'in-progress';
          tasksPerPage: number;
        }

        it('creates a function that returns a formatted query key when the result is an array', () => {
          const queryKeys = createQueryKeys('todos', {
            tuple: ({ id, preview, status, tasksPerPage }: Options) => [id, preview, status, tasksPerPage],
            tupleWithRecord: (id: string, preview: boolean) => [id, { preview }],
          });

          {
            expect(typeof queryKeys.tuple).toBe('function');

            const result = queryKeys.tuple({
              id: 'todo-id',
              preview: true,
              status: 'completed',
              tasksPerPage: 3,
            });

            expect(Array.isArray(result)).toBeTruthy();
            expect(result).toHaveLength(6);
            expect(result).toEqual(['todos', 'tuple', 'todo-id', true, 'completed', 3]);
          }

          {
            expect(typeof queryKeys.tupleWithRecord).toBe('function');

            const result = queryKeys.tupleWithRecord('todo-id', false);

            expect(Array.isArray(result)).toBeTruthy();
            expect(result).toHaveLength(4);
            expect(result).toEqual(['todos', 'tupleWithRecord', 'todo-id', { preview: false }]);
          }
        });
      });

      it('exposes a "_def" property that returns [key, schema.property]', () => {
        const queryKeys = createQueryKeys('todos', {
          todo: (id: string) => id,
        });

        expect(queryKeys.todo).toHaveProperty('_def');

        expect(queryKeys.todo._def).toHaveLength(2);
        expect(queryKeys.todo._def).toEqual(['todos', 'todo']);

        // TODO: delete expectation block on next major release
        {
          const result = queryKeys.todo.toScope();

          expect(result).toHaveLength(2);
          expect(result).toEqual(['todos', 'todo']);
        }
      });
    });
  });
});
