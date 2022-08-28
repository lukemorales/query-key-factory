import { createQueryKeys } from './create-query-keys';

describe('createQueryKeys', () => {
  describe('when called with only one argument', () => {
    it('creates a factory with only "default" if called with one parameter', () => {
      const queryKeys = createQueryKeys('master-key');

      expect(queryKeys).toHaveProperty('default');
      expect(Object.keys(queryKeys)).toHaveLength(1);

      expect(queryKeys).toMatchObject({
        default: ['master-key'],
      });
    });

    it('creates the "default" query key as an array', () => {
      const queryKeys = createQueryKeys('master-key');

      expect(Array.isArray(queryKeys.default)).toBeTruthy();
      expect(queryKeys.default).toHaveLength(1);
    });
  });

  describe('when called with the scope key and the factory schema', () => {
    it('creates a factory that contains the "default" key and the schema', () => {
      const queryKeys = createQueryKeys('master-key', {
        users: 'all',
        products: 'recent',
      });

      expect(queryKeys).toHaveProperty('default');
      expect(queryKeys).toHaveProperty('users');
      expect(queryKeys).toHaveProperty('products');

      expect(queryKeys).toMatchObject({
        default: ['master-key'],
        users: ['master-key', 'users', 'all'],
        products: ['master-key', 'products', 'recent'],
      });
    });

    it('throws an error if the factory schema contains a "default" key', () => {
      expect(() =>
        createQueryKeys('master-key', {
          // @ts-expect-error: "default" should not be an allowed key
          default: 'trying to override the default key value',
          settings: 'admin',
        }),
      ).toThrow('"default" is a key reserved for the "createQueryKeys" function');
    });

    describe('when the schema property is not a function', () => {
      it('creates an array in the shape [default-key, schema-key] if the value is NULL', () => {
        const queryKeys = createQueryKeys('master-key', {
          settings: null,
        });

        expect(queryKeys.settings).toHaveLength(2);
        expect(queryKeys.settings).toStrictEqual(['master-key', 'settings']);
      });

      it('creates an array in the shape [default-key, schema-key, value] if the value is not NULL', () => {
        const queryKeys = createQueryKeys('master-key', {
          'max-products': 5,
          admin: true,
          customer: false,
        });

        expect(queryKeys['max-products']).toHaveLength(3);
        expect(queryKeys.admin).toHaveLength(3);
        expect(queryKeys.customer).toHaveLength(3);

        expect(queryKeys['max-products']).toStrictEqual(['master-key', 'max-products', 5]);
        expect(queryKeys.admin).toStrictEqual(['master-key', 'admin', true]);
        expect(queryKeys.customer).toStrictEqual(['master-key', 'customer', false]);
      });
    });

    describe('when the schema property is a function', () => {
      describe('when the function returns a primitive', () => {
        it('creates a callback that returns a formatted query key', () => {
          const queryKeys = createQueryKeys('master-key', {
            todo: (id: string) => id,
          });

          expect(typeof queryKeys.todo).toBe('function');

          const generatedKey = queryKeys.todo('todo-id');

          expect(Array.isArray(generatedKey)).toBeTruthy();
          expect(generatedKey).toHaveLength(3);
          expect(generatedKey).toStrictEqual(['master-key', 'todo', 'todo-id']);
        });
      });

      describe('when the function returns an object', () => {
        it('creates a callback that returns a formatted query key', () => {
          const queryKeys = createQueryKeys('master-key', {
            todo: (id: string, preview: boolean) => ({ id, preview }),
          });

          expect(typeof queryKeys.todo).toBe('function');

          const generatedKey = queryKeys.todo('todo-id', true);

          expect(Array.isArray(generatedKey)).toBeTruthy();
          expect(generatedKey).toHaveLength(3);
          expect(generatedKey).toStrictEqual(['master-key', 'todo', { id: 'todo-id', preview: true }]);
        });
      });

      describe('when the function returns a tuple', () => {
        it('creates a function that returns a formatted query key when the result is an array', () => {
          const queryKeys = createQueryKeys('master-key', {
            todoWithPreview: <Id extends string>(id: Id, preview: boolean) => [id, { preview }],
          });

          expect(typeof queryKeys.todoWithPreview).toBe('function');

          const generatedKey = queryKeys.todoWithPreview('todo-id', false);

          expect(Array.isArray(generatedKey)).toBeTruthy();
          expect(generatedKey).toHaveLength(4);
          expect(generatedKey).toStrictEqual(['master-key', 'todoWithPreview', 'todo-id', { preview: false }]);
        });
      });

      it('exposes a "toScope" function that returns an array in the shape [default-key, schema-key]', () => {
        const queryKeys = createQueryKeys('master-key', {
          todo: (id: string) => id,
        });

        expect(queryKeys.todo).toHaveProperty('toScope');
        expect(typeof queryKeys.todo.toScope).toBe('function');

        const generatedScopeKey = queryKeys.todo.toScope();

        expect(generatedScopeKey).toHaveLength(2);
        expect(generatedScopeKey).toStrictEqual(['master-key', 'todo']);
      });
    });
  });
});
