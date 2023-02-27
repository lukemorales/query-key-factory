import { MutateFunction } from '@tanstack/query-core';

import { createMutationKeys } from './create-mutation-keys';
import { inferMutationKeys } from './types';

describe('createMutationKeys', () => {
  describe('when called only with the key argument', () => {
    it('creates an object with only "_def" key', () => {
      const sut = createMutationKeys('test');

      expect(sut).toHaveProperty('_def');
      expect(Object.keys(sut)).toHaveLength(1);

      expect(sut).toEqual({
        _def: ['test'],
      });

      expect(sut).toHaveType<{ _def: readonly ['test'] }>();

      expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
        _def: readonly ['test'];
      }>();
    });

    it('creates the "_def" query key as an array', () => {
      const sut = createMutationKeys('test');

      expect(Array.isArray(sut._def)).toBeTruthy();
      expect(sut._def).toHaveLength(1);

      expect(sut._def).toEqual(['test']);
    });
  });

  describe('when called with the key and the schema', () => {
    it('throws an error if the schema contains a key that starts with "_"', () => {
      expect(() =>
        createMutationKeys('users', {
          // @ts-expect-error: "_def" should not be an allowed key
          _def: ['trying to override the _def key value'],
          prop: null,
        }),
      ).toThrow('Keys that start with "_" are reserved for the Query Key Factory');

      expect(() =>
        createMutationKeys('users', {
          // @ts-expect-error: "_my_own_key" should not be an allowed key
          _my_own_key: ['trying to create with the shape of an internal key'],
          prop: null,
        }),
      ).toThrow('Keys that start with "_" are reserved for the Query Key Factory');
    });

    describe('when the schema property is not a function', () => {
      describe('when the property value is NULL', () => {
        it('returns an object with mutationKey in the shape [key, schema.property]', () => {
          const sut = createMutationKeys('test', {
            prop: null,
          });

          expect(sut).toHaveProperty('_def');
          expect(sut).toHaveProperty('prop');

          expect(sut).toEqual({
            _def: ['test'],
            prop: {
              mutationKey: ['test', 'prop'],
            },
          });

          expect(sut.prop).toHaveType<{ mutationKey: readonly ['test', 'prop'] }>();

          expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
            _def: readonly ['test'];
            prop: {
              mutationKey: readonly ['test', 'prop'];
            };
          }>();
        });
      });

      describe('when the property value is a tuple', () => {
        it('returns an object with mutationKey in the shape [key, schema.property, value]', () => {
          const sut = createMutationKeys('test', {
            prop: ['value'],
          });

          expect(sut).toHaveProperty('_def');
          expect(sut).toHaveProperty('prop');

          expect(sut.prop.mutationKey).toHaveLength(3);

          expect(sut.prop).toEqual({
            _def: ['test', 'prop'],
            mutationKey: ['test', 'prop', 'value'],
          });

          expect(sut.prop).toHaveType<{
            _def: readonly ['test', 'prop'];
            mutationKey: readonly ['test', 'prop', string];
          }>();

          expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
            _def: readonly ['test'];
            prop: {
              _def: readonly ['test', 'prop'];
              mutationKey: readonly ['test', 'prop', string];
            };
          }>();
        });
      });

      describe('when the property value is an object', () => {
        describe('when the object has "mutationKey"', () => {
          describe('when the mutationKey value is NULL', () => {
            it('returns an object with mutationKey in the shape [key, schema.property]', () => {
              const sut = createMutationKeys('test', {
                prop: {
                  mutationKey: null,
                },
              });

              expect(sut).toHaveProperty('_def');
              expect(sut).toHaveProperty('prop');

              expect(sut).toEqual({
                _def: ['test'],
                prop: {
                  mutationKey: ['test', 'prop'],
                },
              });

              expect(sut.prop).toHaveType<{
                mutationKey: readonly ['test', 'prop'];
              }>();
            });
          });

          describe('when the mutationKey value is a tuple', () => {
            it('returns an object with mutationKey in the shape [prop, schema.property, value]', () => {
              const sut = createMutationKeys('test', {
                prop: {
                  mutationKey: ['value'],
                },
              });

              expect(sut.prop.mutationKey).toHaveLength(3);

              expect(sut.prop).toEqual({
                _def: ['test', 'prop'],
                mutationKey: ['test', 'prop', 'value'],
              });

              expect(sut.prop).toHaveType<{
                _def: readonly ['test', 'prop'];
                mutationKey: readonly ['test', 'prop', string];
              }>();
            });
          });
        });

        describe('when the object has "mutationKey" and "mutationFn"', () => {
          describe('when the mutationKey value is NULL', () => {
            it('returns an object with mutationKey in the shape [key, schema.property]', () => {
              const sut = createMutationKeys('test', {
                prop: {
                  mutationKey: null,
                  mutationFn: () => Promise.resolve(true),
                },
              });

              expect(sut).toHaveProperty('_def');
              expect(sut).toHaveProperty('prop');

              expect(sut).toEqual({
                _def: ['test'],
                prop: {
                  mutationKey: ['test', 'prop'],
                  mutationFn: expect.any(Function),
                },
              });

              expect(sut.prop).toHaveType<{
                mutationKey: readonly ['test', 'prop'];
                mutationFn: MutateFunction<boolean, unknown, undefined, unknown>;
              }>();
            });
          });

          describe('when the property value is a tuple', () => {
            it('returns an object with mutationKey in the shape [prop, schema.property, value]', () => {
              const sut = createMutationKeys('test', {
                prop: {
                  mutationKey: ['value'],
                  mutationFn: () => Promise.resolve(true),
                },
              });

              expect(sut.prop.mutationKey).toHaveLength(3);

              expect(sut.prop).toEqual({
                _def: ['test', 'prop'],
                mutationKey: ['test', 'prop', 'value'],
                mutationFn: expect.any(Function),
              });

              expect(sut.prop).toHaveType<{
                _def: readonly ['test', 'prop'];
                mutationKey: readonly ['test', 'prop', string];
                mutationFn: MutateFunction<boolean, unknown, undefined, unknown>;
              }>();
            });
          });
        });

        describe('when the object has "mutationKey" and "contextMutations"', () => {
          describe('when the mutationKey value is NULL', () => {
            it('returns an object with mutationKey in the shape [key, schema.property]', () => {
              const sut = createMutationKeys('test', {
                prop: {
                  mutationKey: null,
                  contextMutations: {
                    'context-prop': null,
                  },
                },
              });

              expect(sut).toHaveProperty('_def');
              expect(sut).toHaveProperty('prop');

              expect(sut).toEqual({
                _def: ['test'],
                prop: {
                  _ctx: {
                    'context-prop': {
                      mutationKey: ['test', 'prop', 'context-prop'],
                    },
                  },
                  mutationKey: ['test', 'prop'],
                },
              });

              expect(sut.prop).toHaveType<{
                _ctx: {
                  'context-prop': {
                    mutationKey: readonly ['test', 'prop', 'context-prop'];
                  };
                };
                mutationKey: readonly ['test', 'prop'];
              }>();
            });
          });

          describe('when the property value is a tuple', () => {
            it('returns an object with mutationKey in the shape [prop, schema.property, value]', () => {
              const sut = createMutationKeys('test', {
                prop: {
                  mutationKey: ['value'],
                  contextMutations: {
                    'context-prop': null,
                  },
                },
              });

              expect(sut.prop.mutationKey).toHaveLength(3);

              expect(sut.prop).toEqual({
                _def: ['test', 'prop'],
                _ctx: {
                  'context-prop': {
                    mutationKey: ['test', 'prop', 'value', 'context-prop'],
                  },
                },
                mutationKey: ['test', 'prop', 'value'],
              });

              expect(sut.prop).toHaveType<{
                _def: readonly ['test', 'prop'];
                _ctx: {
                  'context-prop': {
                    mutationKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                mutationKey: readonly ['test', 'prop', string];
              }>();
            });
          });
        });

        describe('when the object has "mutationKey", "mutationFn" and "contextMutations"', () => {
          describe('when the mutationKey value is NULL', () => {
            it('returns an object with mutationKey in the shape [key, schema.property]', () => {
              const sut = createMutationKeys('test', {
                prop: {
                  mutationKey: null,
                  mutationFn: () => Promise.resolve(true),
                  contextMutations: {
                    'context-prop': null,
                  },
                },
              });

              expect(sut).toHaveProperty('_def');
              expect(sut).toHaveProperty('prop');

              expect(sut).toEqual({
                _def: ['test'],
                prop: {
                  _ctx: {
                    'context-prop': {
                      mutationKey: ['test', 'prop', 'context-prop'],
                    },
                  },
                  mutationKey: ['test', 'prop'],
                  mutationFn: expect.any(Function),
                },
              });

              expect(sut.prop).toHaveType<{
                _ctx: {
                  'context-prop': {
                    mutationKey: readonly ['test', 'prop', 'context-prop'];
                  };
                };
                mutationKey: readonly ['test', 'prop'];
                mutationFn: MutateFunction<boolean, unknown, undefined, unknown>;
              }>();
            });
          });

          describe('when the property value is a tuple', () => {
            it('returns an object with mutationKey in the shape [prop, schema.property, value]', () => {
              const sut = createMutationKeys('test', {
                prop: {
                  mutationKey: ['value'],
                  mutationFn: () => Promise.resolve(true),
                  contextMutations: {
                    'context-prop': null,
                  },
                },
              });

              expect(sut.prop.mutationKey).toHaveLength(3);

              expect(sut.prop).toEqual({
                _def: ['test', 'prop'],
                _ctx: {
                  'context-prop': {
                    mutationKey: ['test', 'prop', 'value', 'context-prop'],
                  },
                },
                mutationKey: ['test', 'prop', 'value'],
                mutationFn: expect.any(Function),
              });

              expect(sut.prop).toHaveType<{
                _def: readonly ['test', 'prop'];
                _ctx: {
                  'context-prop': {
                    mutationKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                mutationKey: readonly ['test', 'prop', string];
                mutationFn: MutateFunction<boolean, unknown, undefined, unknown>;
              }>();
            });
          });
        });
      });
    });

    describe('when the schema property is a function', () => {
      it('creates a callback that returns the an object with mutationKey', () => {
        const sut = createMutationKeys('test', {
          prop: (value: string) => [value],
        });

        expect(typeof sut.prop).toBe('function');

        expect(sut.prop).toHaveProperty('_def');
        expect(sut.prop._def).toEqual(['test', 'prop']);

        const result = sut.prop('value');

        expect(result).toHaveProperty('mutationKey');

        expect(Array.isArray(result.mutationKey)).toBeTruthy();
        expect(result.mutationKey).toHaveLength(3);
        expect(result).toEqual({
          mutationKey: ['test', 'prop', 'value'],
        });

        expect(sut.prop).toHaveType<
          { _def: readonly ['test', 'prop'] } & ((value: string) => {
            mutationKey: readonly ['test', 'prop', string];
          })
        >();

        expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
          _def: readonly ['test'];
          prop: {
            _def: readonly ['test', 'prop'];
            mutationKey: readonly ['test', 'prop', string];
          };
        }>();
      });

      describe('when the function returns a tuple', () => {
        it('creates a callback that returns the an object with mutationKey', () => {
          const sut = createMutationKeys('test', {
            prop: (value: string) => [value],
          });

          const result = sut.prop('value');

          expect(result).toEqual({
            mutationKey: ['test', 'prop', 'value'],
          });

          expect(sut.prop).toHaveType<
            { _def: readonly ['test', 'prop'] } & ((value: string) => {
              mutationKey: readonly ['test', 'prop', string];
            })
          >();

          expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
            _def: readonly ['test'];
            prop: {
              _def: readonly ['test', 'prop'];
              mutationKey: readonly ['test', 'prop', string];
            };
          }>();
        });
      });

      describe('when the function returns an object', () => {
        describe('when the object has "mutationKey"', () => {
          it('creates a callback that returns "mutationKey"', () => {
            const sut = createMutationKeys('test', {
              prop: (value: string) => ({
                mutationKey: [value],
              }),
            });

            const result = sut.prop('value');
            expect(result).toEqual({
              mutationKey: ['test', 'prop', 'value'],
            });

            expect(sut.prop).toHaveStrictType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                mutationKey: readonly ['test', 'prop', string];
              })
            >();

            expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                mutationKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });

        describe('when the object has "mutationKey" and "mutationFn"', () => {
          it('creates a callback that returns the query options', () => {
            const sut = createMutationKeys('test', {
              prop: (value: string) => ({
                mutationKey: [value],
                mutationFn: () => Promise.resolve(true),
              }),
            });

            const result = sut.prop('value');
            expect(result).toEqual({
              mutationKey: ['test', 'prop', 'value'],
              mutationFn: expect.any(Function),
            });

            expect(sut.prop).toHaveType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                mutationKey: readonly ['test', 'prop', string];
                mutationFn: MutateFunction<boolean, unknown, undefined, unknown>;
              })
            >();

            expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                mutationKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });

        describe('when the object has "mutationKey" and "contextMutations"', () => {
          it('creates a callback that returns an object with mutationKey and _ctx', () => {
            const sut = createMutationKeys('test', {
              prop: (value: string) => ({
                mutationKey: [value],
                contextMutations: {
                  'context-prop': null,
                },
              }),
            });

            const result = sut.prop('value');

            expect(result).toEqual({
              _ctx: {
                'context-prop': {
                  mutationKey: ['test', 'prop', 'value', 'context-prop'],
                },
              },
              mutationKey: ['test', 'prop', 'value'],
            });

            expect(sut.prop).toHaveType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                _ctx: {
                  'context-prop': {
                    mutationKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                mutationKey: readonly ['test', 'prop', string];
              })
            >();

            expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                _ctx: {
                  'context-prop': {
                    mutationKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                mutationKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });

        describe('when the object has "mutationKey", "mutationFn" and "contextMutations"', () => {
          it('creates a callback that returns an object with query options and _ctx', () => {
            const sut = createMutationKeys('test', {
              prop: (value: string) => ({
                mutationKey: [value],
                mutationFn: () => Promise.resolve(true),
                contextMutations: {
                  'context-prop': null,
                },
              }),
            });

            const result = sut.prop('value');

            expect(result).toEqual({
              _ctx: {
                'context-prop': {
                  mutationKey: ['test', 'prop', 'value', 'context-prop'],
                },
              },
              mutationKey: ['test', 'prop', 'value'],
              mutationFn: expect.any(Function),
            });

            expect(sut.prop).toHaveType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                _ctx: {
                  'context-prop': {
                    mutationKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                mutationKey: readonly ['test', 'prop', string];
                mutationFn: MutateFunction<boolean, unknown, undefined, unknown>;
              })
            >();

            expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                _ctx: {
                  'context-prop': {
                    mutationKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                mutationKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });
      });
    });
  });
});

describe('createMutationKeys |> extrapolating "contextMutations" nesting', () => {
  describe('when setting as a static key', () => {
    it('returns the expected types and shape', () => {
      const sut = createMutationKeys('test', {
        prop: {
          mutationKey: null,
          contextMutations: {
            nested1: null,
            nested2: ['context-prop-2'],
            nested3: (value: string) => ({
              mutationKey: [value],
              contextMutations: {
                nested4: null,
              },
            }),
          },
        },
      });

      expect(sut).toEqual({
        _def: ['test'],
        prop: {
          mutationKey: ['test', 'prop'],
          _ctx: {
            nested1: {
              mutationKey: ['test', 'prop', 'nested1'],
            },
            nested2: {
              _def: ['test', 'prop', 'nested2'],
              mutationKey: ['test', 'prop', 'nested2', 'context-prop-2'],
            },
            nested3: expect.any(Function),
          },
        },
      });

      expect(sut.prop._ctx.nested3._def).toEqual(['test', 'prop', 'nested3']);

      const result = sut.prop._ctx.nested3('context-prop-3');
      expect(result).toEqual({
        mutationKey: ['test', 'prop', 'nested3', 'context-prop-3'],
        _ctx: {
          nested4: {
            mutationKey: ['test', 'prop', 'nested3', 'context-prop-3', 'nested4'],
          },
        },
      });

      expect(sut.prop).toHaveType<{
        mutationKey: readonly ['test', 'prop'];
        _ctx: {
          nested1: { mutationKey: readonly ['test', 'prop', 'nested1'] };
          nested2: {
            _def: readonly ['test', 'prop', 'nested2'];
            mutationKey: readonly ['test', 'prop', 'nested2', string];
          };
          nested3: { _def: readonly ['test', 'prop', 'nested3'] } & ((value: string) => {
            mutationKey: readonly ['test', 'prop', 'nested3', string];
            _ctx: {
              nested4: { mutationKey: readonly ['test', 'prop', 'nested3', string, 'nested4'] };
            };
          });
        };
      }>();

      expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
        _def: readonly ['test'];
        prop: {
          mutationKey: readonly ['test', 'prop'];
          _ctx: {
            nested1: { mutationKey: readonly ['test', 'prop', 'nested1'] };
            nested2: {
              _def: readonly ['test', 'prop', 'nested2'];
              mutationKey: readonly ['test', 'prop', 'nested2', string];
            };
            nested3: {
              _def: readonly ['test', 'prop', 'nested3'];
              mutationKey: readonly ['test', 'prop', 'nested3', string];
              _ctx: {
                nested4: {
                  mutationKey: readonly ['test', 'prop', 'nested3', string, 'nested4'];
                };
              };
            };
          };
        };
      }>();
    });
  });

  describe('when setting as a dynamic key', () => {
    it('returns the expected types and shape', () => {
      const sut = createMutationKeys('test', {
        prop: (value: string) => ({
          mutationKey: [value],
          contextMutations: {
            nested1: null,
            nested2: ['context-prop-2'],
            nested3: (nestedValue: string) => ({
              mutationKey: [nestedValue],
              contextMutations: {
                nested4: null,
              },
            }),
          },
        }),
      });

      expect(sut).toEqual({
        _def: ['test'],
        prop: expect.any(Function),
      });

      expect(sut.prop._def).toEqual(['test', 'prop']);

      const result = sut.prop('context-props');
      expect(result).toEqual({
        mutationKey: ['test', 'prop', 'context-props'],
        _ctx: {
          nested1: {
            mutationKey: ['test', 'prop', 'context-props', 'nested1'],
          },
          nested2: {
            _def: ['test', 'prop', 'context-props', 'nested2'],
            mutationKey: ['test', 'prop', 'context-props', 'nested2', 'context-prop-2'],
          },
          nested3: expect.any(Function),
        },
      });

      expect(sut.prop).toHaveType<
        {
          _def: readonly ['test', 'prop'];
        } & ((value: string) => {
          mutationKey: readonly ['test', 'prop', string];
          _ctx: {
            nested1: { mutationKey: readonly ['test', 'prop', string, 'nested1'] };
            nested2: {
              _def: readonly ['test', 'prop', string, 'nested2'];
              mutationKey: readonly ['test', 'prop', string, 'nested2', string];
            };
            nested3: { _def: readonly ['test', 'prop', string, 'nested3'] } & ((nestedValue: string) => {
              mutationKey: readonly ['test', 'prop', string, 'nested3', string];
              _ctx: {
                nested4: { mutationKey: readonly ['test', 'prop', string, 'nested3', string, 'nested4'] };
              };
            });
          };
        })
      >();

      expect({} as inferMutationKeys<typeof sut>).toHaveStrictType<{
        _def: readonly ['test'];
        prop: {
          _def: readonly ['test', 'prop'];
          mutationKey: readonly ['test', 'prop', string];
          _ctx: {
            nested1: { mutationKey: readonly ['test', 'prop', string, 'nested1'] };
            nested2: {
              _def: readonly ['test', 'prop', string, 'nested2'];
              mutationKey: readonly ['test', 'prop', string, 'nested2', string];
            };
            nested3: {
              _def: readonly ['test', 'prop', string, 'nested3'];
              mutationKey: readonly ['test', 'prop', string, 'nested3', string];
              _ctx: {
                nested4: {
                  mutationKey: readonly ['test', 'prop', string, 'nested3', string, 'nested4'];
                };
              };
            };
          };
        };
      }>();
    });
  });
});
