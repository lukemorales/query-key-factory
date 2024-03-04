/* eslint-disable max-classes-per-file */

class QueryBuilder<T extends string, U extends object> {
  protected schema: U = {} as U;

  constructor(feature: T) {
    this.schema = {
      def: [feature],
    } as U;
  }

  query() {
    return this;
  }
}

const a = new QueryBuilder('english');

class InnerBuilder<T extends string, U extends object> extends QueryBuilder<T, U> {
  build() {
    return this.schema;
  }
}

function create<A extends string>(en: A): ReturnType<InnerBuilder<A, {}>['build']> {
  return new InnerBuilder(en).build();
}
