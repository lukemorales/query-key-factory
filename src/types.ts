import { Add } from './types.utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyObject = Record<string, unknown>;

export type KeyScopeTuple = [KeyScopeValue | undefined, ...Array<KeyScopeValue | undefined>];

type FactoryCallback = (...args: any[]) => KeyScopeValue | KeyScopeTuple;

export type KeyScopeValue = string | number | boolean | AnyObject;

type FactoryProperty = Exclude<KeyScopeValue, AnyObject> | null | FactoryCallback;

export type FactoryObject = Record<string, FactoryProperty>;

type ValidateSchema<Schema extends FactoryObject> = Omit<Schema, 'default'>;

export type ValidateFactory<Schema extends FactoryObject> = Schema extends {
  ['default']: Schema['default'];
}
  ? ValidateSchema<Schema>
  : Schema;

export type FactoryOutputCallback<
  Key,
  Property,
  Callback extends FactoryCallback,
  CallbackResult extends ReturnType<Callback> = ReturnType<Callback>,
> = {
  (...args: Parameters<Callback>): CallbackResult extends [...infer TupleResult]
    ? readonly [Key, Property, ...TupleResult]
    : CallbackResult extends AnyObject
    ? readonly [
        Key,
        Property,
        {
          [SubKey in keyof CallbackResult]: CallbackResult[SubKey];
        },
      ]
    : readonly [Key, Property, CallbackResult];
  toScope: () => readonly [Key, Property];
};

export type FactoryOutput<Key extends string, FactorySchema extends FactoryObject> = {
  [P in keyof FactorySchema]: FactorySchema[P] extends FactoryCallback
    ? FactoryOutputCallback<Key, P, FactorySchema[P]>
    : FactorySchema[P] extends null
    ? readonly [Key, P]
    : readonly [Key, P, FactorySchema[P]];
};

export type DefaultKey<Key extends string> = Record<'default', readonly [Key]>;

export type QueryKeyFactoryResult<Key extends string, FactorySchema extends FactoryObject> = DefaultKey<Key> &
  FactoryOutput<Key, FactorySchema>;

export type AnyFactoryOutput = DefaultKey<string> | QueryKeyFactoryResult<string, any>;

export type inferQueryKeys<FactorySchema extends AnyFactoryOutput> = {
  [P in keyof FactorySchema]: FactorySchema[P] extends (...args: any[]) => readonly any[]
    ? ReturnType<FactorySchema[P]>
    : FactorySchema[P];
};

export type FactoryFromMergedQueryKeys<
  FactoryOutputs extends AnyFactoryOutput[],
  Index extends number = 0,
> = FactoryOutputs[Index] extends null | undefined
  ? {} // eslint-disable-line @typescript-eslint/ban-types
  : {
      [P in FactoryOutputs[Index]['default'][0]]: FactoryOutputs[Index];
    } & FactoryFromMergedQueryKeys<FactoryOutputs, Add<Index, 1>>;

export type inferMergedFactory<Schema extends FactoryFromMergedQueryKeys<[]>> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof Schema]: Schema[P] extends AnyFactoryOutput ? inferQueryKeys<Schema[P]> : {};
};
