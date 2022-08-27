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
      ).toThrow();
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
      it('creates a function that returns a formatted query key', () => {
        const queryKeys = createQueryKeys('master-key', {
          search: (query: string, maxResults: number) => ({ query, maxResults }),
        });

        expect(typeof queryKeys.search).toBe('function');

        const generatedKey = queryKeys.search('tanstack', 5);

        expect(Array.isArray(generatedKey)).toBeTruthy();
        expect(generatedKey).toHaveLength(3);
        expect(generatedKey).toStrictEqual(['master-key', 'search', { query: 'tanstack', maxResults: 5 }]);
      });

      it('exposes a "toScope" function that returns an array in the shape [default-key, schema-key]', () => {
        const queryKeys = createQueryKeys('master-key', {
          search: (query: string, maxResults: number) => ({ query, maxResults }),
        });

        expect(queryKeys.search).toHaveProperty('toScope');
        expect(typeof queryKeys.search.toScope).toBe('function');

        const generatedScopeKey = queryKeys.search.toScope();

        expect(generatedScopeKey).toHaveLength(2);
        expect(generatedScopeKey).toStrictEqual(['master-key', 'search']);
      });
    });
  });
});
