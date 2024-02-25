import type { QueryFunction } from '@tanstack/query-core';

import { createQueryKeys } from './create-query-keys';
import type { inferQueryKeys } from './utility-types';

describe('createQueryKeys', () => {
  describe('when called only with the key argument', () => {
    it('creates an object with only "_def" key', () => {
      const sut = createQueryKeys('test');

      expect(sut).toHaveProperty('_def');
      expect(Object.keys(sut)).toHaveLength(1);

      expect(sut).toEqual({
        _def: ['test'],
      });

      expect(sut).toHaveType<{ _def: readonly ['test'] }>();

      expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
        _def: readonly ['test'];
      }>();
    });

    it('creates the "_def" query key as an array', () => {
      const sut = createQueryKeys('test');

      expect(Array.isArray(sut._def)).toBeTruthy();
      expect(sut._def).toHaveLength(1);

      expect(sut._def).toEqual(['test']);
    });
  });

  describe('when called with the key and the schema', () => {
    it('throws an error if the schema contains a key that starts with "_"', () => {
      expect(() =>
        createQueryKeys('users', {
          // @ts-expect-error: "_myOwnKey" should not be an allowed key
          _def: ['trying to override the _def key value'],
          prop: null,
        }),
      ).toThrow('Keys that start with "_" are reserved for Query Key Factory');

      expect(() =>
        createQueryKeys('users', {
          // @ts-expect-error: "_myOwnKey" should not be an allowed key
          _myOwnKey: ['trying to create with the shape of an internal key'],
          prop: null,
        }),
      ).toThrow('Keys that start with "_" are reserved for Query Key Factory');
    });

    describe('when the schema property is not a function', () => {
      describe('when the property value is NULL', () => {
        it('returns an object with queryKey in the shape [key, schema.property]', () => {
          const sut = createQueryKeys('test', {
            prop: null,
          });

          expect(sut).toHaveProperty('_def');
          expect(sut).toHaveProperty('prop');

          expect(sut).toEqual({
            _def: ['test'],
            prop: {
              queryKey: ['test', 'prop'],
            },
          });

          expect(sut.prop).toHaveType<{ queryKey: readonly ['test', 'prop'] }>();

          expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
            _def: readonly ['test'];
            prop: {
              queryKey: readonly ['test', 'prop'];
            };
          }>();
        });
      });

      describe('when the property value is a tuple', () => {
        it('returns an object with queryKey in the shape [key, schema.property, value]', () => {
          const sut = createQueryKeys('test', {
            prop: ['value'],
          });

          expect(sut).toHaveProperty('_def');
          expect(sut).toHaveProperty('prop');

          expect(sut.prop.queryKey).toHaveLength(3);

          expect(sut.prop).toEqual({
            _def: ['test', 'prop'],
            queryKey: ['test', 'prop', 'value'],
          });

          expect(sut.prop).toHaveType<{
            _def: readonly ['test', 'prop'];
            queryKey: readonly ['test', 'prop', string];
          }>();

          expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
            _def: readonly ['test'];
            prop: {
              _def: readonly ['test', 'prop'];
              queryKey: readonly ['test', 'prop', string];
            };
          }>();
        });
      });

      describe('when the property value is an object', () => {
        describe('when the object has "queryKey"', () => {
          describe('when the queryKey value is NULL', () => {
            it('returns an object with queryKey in the shape [key, schema.property]', () => {
              const sut = createQueryKeys('test', {
                prop: {
                  queryKey: null,
                },
              });

              expect(sut).toHaveProperty('_def');
              expect(sut).toHaveProperty('prop');

              expect(sut).toEqual({
                _def: ['test'],
                prop: {
                  queryKey: ['test', 'prop'],
                },
              });

              expect(sut.prop).toHaveType<{
                queryKey: readonly ['test', 'prop'];
              }>();
            });
          });

          describe('when the queryKey value is a tuple', () => {
            it('returns an object with queryKey in the shape [prop, schema.property, value]', () => {
              const sut = createQueryKeys('test', {
                prop: {
                  queryKey: ['value'],
                },
              });

              expect(sut.prop.queryKey).toHaveLength(3);

              expect(sut.prop).toEqual({
                _def: ['test', 'prop'],
                queryKey: ['test', 'prop', 'value'],
              });

              expect(sut.prop).toHaveType<{
                _def: readonly ['test', 'prop'];
                queryKey: readonly ['test', 'prop', string];
              }>();
            });
          });
        });

        describe('when the object has "queryKey" and "queryFn"', () => {
          describe('when the queryKey value is NULL', () => {
            it('returns an object with queryKey in the shape [key, schema.property]', () => {
              const sut = createQueryKeys('test', {
                prop: {
                  queryKey: null,
                  queryFn: () => Promise.resolve(true),
                },
              });

              expect(sut).toHaveProperty('_def');
              expect(sut).toHaveProperty('prop');

              expect(sut).toEqual({
                _def: ['test'],
                prop: {
                  queryKey: ['test', 'prop'],
                  queryFn: expect.any(Function),
                },
              });

              expect(sut.prop).toHaveType<{
                queryKey: readonly ['test', 'prop'];
                queryFn: QueryFunction<boolean, readonly ['test', 'prop']>;
              }>();
            });
          });

          describe('when the property value is a tuple', () => {
            it('returns an object with queryKey in the shape [prop, schema.property, value]', () => {
              const sut = createQueryKeys('test', {
                prop: {
                  queryKey: ['value'],
                  queryFn: () => Promise.resolve(true),
                },
              });

              expect(sut.prop.queryKey).toHaveLength(3);

              expect(sut.prop).toEqual({
                _def: ['test', 'prop'],
                queryKey: ['test', 'prop', 'value'],
                queryFn: expect.any(Function),
              });

              expect(sut.prop).toHaveType<{
                _def: readonly ['test', 'prop'];
                queryKey: readonly ['test', 'prop', string];
                queryFn: QueryFunction<boolean, readonly ['test', 'prop', string]>;
              }>();
            });
          });
        });

        describe('when the object has "queryKey" and "contextQueries"', () => {
          describe('when the queryKey value is NULL', () => {
            it('returns an object with queryKey in the shape [key, schema.property]', () => {
              const sut = createQueryKeys('test', {
                prop: {
                  queryKey: null,
                  contextQueries: {
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
                      queryKey: ['test', 'prop', 'context-prop'],
                    },
                  },
                  queryKey: ['test', 'prop'],
                },
              });

              expect(sut.prop).toHaveType<{
                _ctx: {
                  'context-prop': {
                    queryKey: readonly ['test', 'prop', 'context-prop'];
                  };
                };
                queryKey: readonly ['test', 'prop'];
              }>();
            });
          });

          describe('when the property value is a tuple', () => {
            it('returns an object with queryKey in the shape [prop, schema.property, value]', () => {
              const sut = createQueryKeys('test', {
                prop: {
                  queryKey: ['value'],
                  contextQueries: {
                    'context-prop': null,
                  },
                },
              });

              expect(sut.prop.queryKey).toHaveLength(3);

              expect(sut.prop).toEqual({
                _def: ['test', 'prop'],
                _ctx: {
                  'context-prop': {
                    queryKey: ['test', 'prop', 'value', 'context-prop'],
                  },
                },
                queryKey: ['test', 'prop', 'value'],
              });

              expect(sut.prop).toHaveType<{
                _def: readonly ['test', 'prop'];
                _ctx: {
                  'context-prop': {
                    queryKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                queryKey: readonly ['test', 'prop', string];
              }>();
            });
          });
        });

        describe('when the object has "queryKey", "queryFn" and "contextQueries"', () => {
          describe('when the queryKey value is NULL', () => {
            it('returns an object with queryKey in the shape [key, schema.property]', () => {
              const sut = createQueryKeys('test', {
                prop: {
                  queryKey: null,
                  queryFn: () => Promise.resolve(true),
                  contextQueries: {
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
                      queryKey: ['test', 'prop', 'context-prop'],
                    },
                  },
                  queryKey: ['test', 'prop'],
                  queryFn: expect.any(Function),
                },
              });

              expect(sut.prop).toHaveType<{
                _ctx: {
                  'context-prop': {
                    queryKey: readonly ['test', 'prop', 'context-prop'];
                  };
                };
                queryKey: readonly ['test', 'prop'];
                queryFn: QueryFunction<boolean, readonly ['test', 'prop']>;
              }>();
            });
          });

          describe('when the property value is a tuple', () => {
            it('returns an object with queryKey in the shape [prop, schema.property, value]', () => {
              const sut = createQueryKeys('test', {
                prop: {
                  queryKey: ['value'],
                  queryFn: () => Promise.resolve(true),
                  contextQueries: {
                    'context-prop': null,
                  },
                },
              });

              expect(sut.prop.queryKey).toHaveLength(3);

              expect(sut.prop).toEqual({
                _def: ['test', 'prop'],
                _ctx: {
                  'context-prop': {
                    queryKey: ['test', 'prop', 'value', 'context-prop'],
                  },
                },
                queryKey: ['test', 'prop', 'value'],
                queryFn: expect.any(Function),
              });

              expect(sut.prop).toHaveType<{
                _def: readonly ['test', 'prop'];
                _ctx: {
                  'context-prop': {
                    queryKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                queryKey: readonly ['test', 'prop', string];
                queryFn: QueryFunction<boolean, readonly ['test', 'prop', string]>;
              }>();
            });
          });
        });
      });
    });

    describe('when the schema property is a function', () => {
      it('creates a callback that returns the an object with queryKey', () => {
        const sut = createQueryKeys('test', {
          prop: (value: string) => [value],
        });

        expect(typeof sut.prop).toBe('function');

        expect(sut.prop).toHaveProperty('_def');
        expect(sut.prop._def).toEqual(['test', 'prop']);

        const result = sut.prop('value');

        expect(result).toHaveProperty('queryKey');

        expect(Array.isArray(result.queryKey)).toBeTruthy();
        expect(result.queryKey).toHaveLength(3);
        expect(result).toEqual({
          queryKey: ['test', 'prop', 'value'],
        });

        expect(sut.prop).toHaveType<
          { _def: readonly ['test', 'prop'] } & ((value: string) => {
            queryKey: readonly ['test', 'prop', string];
          })
        >();

        expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
          _def: readonly ['test'];
          prop: {
            _def: readonly ['test', 'prop'];
            queryKey: readonly ['test', 'prop', string];
          };
        }>();
      });

      describe('when the function returns a tuple', () => {
        it('creates a callback that returns the an object with queryKey', () => {
          const sut = createQueryKeys('test', {
            prop: (value: string) => [value],
          });

          const result = sut.prop('value');

          expect(result).toEqual({
            queryKey: ['test', 'prop', 'value'],
          });

          expect(sut.prop).toHaveType<
            { _def: readonly ['test', 'prop'] } & ((value: string) => {
              queryKey: readonly ['test', 'prop', string];
            })
          >();

          expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
            _def: readonly ['test'];
            prop: {
              _def: readonly ['test', 'prop'];
              queryKey: readonly ['test', 'prop', string];
            };
          }>();
        });
      });

      describe('when the function returns an object', () => {
        describe('when the object has extra unintended properties', () => {
          it('creates a callback that returns the expected shape without the extra unintended properties', () => {
            const sut = createQueryKeys('test', {
              // @ts-expect-error prop return is invalid as staleTime is an invalidKey
              prop: (value: string) => ({
                queryKey: [value],
                staleTime: Infinity,
              }),
            });

            const result = sut.prop('value');
            expect(result).toEqual({
              queryKey: ['test', 'prop', 'value'],
            });

            expect(sut.prop).toHaveStrictType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                queryKey: readonly ['test', 'prop', string];
              })
            >();

            expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                queryKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });

        describe('when the object has "queryKey"', () => {
          it('creates a callback that returns "queryKey"', () => {
            const sut = createQueryKeys('test', {
              prop: (value: string) => ({
                queryKey: [value],
              }),
            });

            const result = sut.prop('value');
            expect(result).toEqual({
              queryKey: ['test', 'prop', 'value'],
            });

            expect(sut.prop).toHaveStrictType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                queryKey: readonly ['test', 'prop', string];
              })
            >();

            expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                queryKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });

        describe('when the object has "queryKey" and "queryFn"', () => {
          it('creates a callback that returns the query options', () => {
            const sut = createQueryKeys('test', {
              prop: (value: string) => ({
                queryKey: [value],
                queryFn: () => Promise.resolve(true),
              }),
            });

            const result = sut.prop('value');
            expect(result).toEqual({
              queryKey: ['test', 'prop', 'value'],
              queryFn: expect.any(Function),
            });

            expect(sut.prop).toHaveType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                queryKey: readonly ['test', 'prop', string];
                queryFn: QueryFunction<boolean, readonly ['test', 'prop', string]>;
              })
            >();

            expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                queryKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });

        describe('when the object has "queryKey" and "contextQueries"', () => {
          it('creates a callback that returns an object with queryKey and _ctx', () => {
            const sut = createQueryKeys('test', {
              prop: (value: string) => ({
                queryKey: [value],
                contextQueries: {
                  'context-prop': null,
                },
              }),
            });

            const result = sut.prop('value');

            expect(result).toEqual({
              _ctx: {
                'context-prop': {
                  queryKey: ['test', 'prop', 'value', 'context-prop'],
                },
              },
              queryKey: ['test', 'prop', 'value'],
            });

            expect(sut.prop).toHaveType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                _ctx: {
                  'context-prop': {
                    queryKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                queryKey: readonly ['test', 'prop', string];
              })
            >();

            expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                _ctx: {
                  'context-prop': {
                    queryKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                queryKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });

        describe('when the object has "queryKey", "queryFn" and "contextQueries"', () => {
          it('creates a callback that returns an object with query options and _ctx', () => {
            const sut = createQueryKeys('test', {
              prop: (value: string) => ({
                queryKey: [value],
                queryFn: () => Promise.resolve(true),
                contextQueries: {
                  'context-prop': null,
                },
              }),
            });

            const result = sut.prop('value');

            expect(result).toEqual({
              _ctx: {
                'context-prop': {
                  queryKey: ['test', 'prop', 'value', 'context-prop'],
                },
              },
              queryKey: ['test', 'prop', 'value'],
              queryFn: expect.any(Function),
            });

            expect(sut.prop).toHaveType<
              { _def: readonly ['test', 'prop'] } & ((value: string) => {
                _ctx: {
                  'context-prop': {
                    queryKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                queryKey: readonly ['test', 'prop', string];
                queryFn: QueryFunction<boolean, readonly ['test', 'prop', string]>;
              })
            >();

            expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
              _def: readonly ['test'];
              prop: {
                _def: readonly ['test', 'prop'];
                _ctx: {
                  'context-prop': {
                    queryKey: readonly ['test', 'prop', string, 'context-prop'];
                  };
                };
                queryKey: readonly ['test', 'prop', string];
              };
            }>();
          });
        });
      });
    });
  });
});

describe('createQueryKeys |> extrapolating "contextQueries" nesting', () => {
  describe('when setting as a static key', () => {
    it('returns the expected types and shape', () => {
      const sut = createQueryKeys('test', {
        prop: {
          queryKey: null,
          contextQueries: {
            nested1: null,
            nested2: ['context-prop-2'],
            nested3: (value: string) => ({
              queryKey: [value],
              contextQueries: {
                nested4: null,
              },
            }),
          },
        },
      });

      expect(sut).toEqual({
        _def: ['test'],
        prop: {
          queryKey: ['test', 'prop'],
          _ctx: {
            nested1: {
              queryKey: ['test', 'prop', 'nested1'],
            },
            nested2: {
              _def: ['test', 'prop', 'nested2'],
              queryKey: ['test', 'prop', 'nested2', 'context-prop-2'],
            },
            nested3: expect.any(Function),
          },
        },
      });

      expect(sut.prop._ctx.nested3._def).toEqual(['test', 'prop', 'nested3']);

      const result = sut.prop._ctx.nested3('context-prop-3');
      expect(result).toEqual({
        queryKey: ['test', 'prop', 'nested3', 'context-prop-3'],
        _ctx: {
          nested4: {
            queryKey: ['test', 'prop', 'nested3', 'context-prop-3', 'nested4'],
          },
        },
      });

      expect(sut.prop).toHaveType<{
        queryKey: readonly ['test', 'prop'];
        _ctx: {
          nested1: { queryKey: readonly ['test', 'prop', 'nested1'] };
          nested2: {
            _def: readonly ['test', 'prop', 'nested2'];
            queryKey: readonly ['test', 'prop', 'nested2', string];
          };
          nested3: { _def: readonly ['test', 'prop', 'nested3'] } & ((value: string) => {
            queryKey: readonly ['test', 'prop', 'nested3', string];
            _ctx: {
              nested4: { queryKey: readonly ['test', 'prop', 'nested3', string, 'nested4'] };
            };
          });
        };
      }>();

      expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
        _def: readonly ['test'];
        prop: {
          queryKey: readonly ['test', 'prop'];
          _ctx: {
            nested1: { queryKey: readonly ['test', 'prop', 'nested1'] };
            nested2: {
              _def: readonly ['test', 'prop', 'nested2'];
              queryKey: readonly ['test', 'prop', 'nested2', string];
            };
            nested3: {
              _def: readonly ['test', 'prop', 'nested3'];
              queryKey: readonly ['test', 'prop', 'nested3', string];
              _ctx: {
                nested4: {
                  queryKey: readonly ['test', 'prop', 'nested3', string, 'nested4'];
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
      const sut = createQueryKeys('test', {
        prop: (value: string) => ({
          queryKey: [value],
          contextQueries: {
            nested1: null,
            nested2: ['context-prop-2'],
            nested3: (nestedValue?: string) => ({
              queryKey: [nestedValue],
              contextQueries: {
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
        queryKey: ['test', 'prop', 'context-props'],
        _ctx: {
          nested1: {
            queryKey: ['test', 'prop', 'context-props', 'nested1'],
          },
          nested2: {
            _def: ['test', 'prop', 'context-props', 'nested2'],
            queryKey: ['test', 'prop', 'context-props', 'nested2', 'context-prop-2'],
          },
          nested3: expect.any(Function),
        },
      });

      expect(sut.prop).toHaveType<
        {
          _def: readonly ['test', 'prop'];
        } & ((value: string) => {
          queryKey: readonly ['test', 'prop', string];
          _ctx: {
            nested1: { queryKey: readonly ['test', 'prop', string, 'nested1'] };
            nested2: {
              _def: readonly ['test', 'prop', string, 'nested2'];
              queryKey: readonly ['test', 'prop', string, 'nested2', string];
            };
            nested3: { _def: readonly ['test', 'prop', string, 'nested3'] } & ((nestedValue?: string) => {
              queryKey: readonly ['test', 'prop', string, 'nested3', string];
              _ctx: {
                nested4: { queryKey: readonly ['test', 'prop', string, 'nested3', string, 'nested4'] };
              };
            });
          };
        })
      >();

      expect({} as inferQueryKeys<typeof sut>).toHaveStrictType<{
        _def: readonly ['test'];
        prop: {
          _def: readonly ['test', 'prop'];
          queryKey: readonly ['test', 'prop', string];
          _ctx: {
            nested1: { queryKey: readonly ['test', 'prop', string, 'nested1'] };
            nested2: {
              _def: readonly ['test', 'prop', string, 'nested2'];
              queryKey: readonly ['test', 'prop', string, 'nested2', string];
            };
            nested3: {
              _def: readonly ['test', 'prop', string, 'nested3'];
              queryKey: readonly ['test', 'prop', string, 'nested3', string | undefined];
              _ctx: {
                nested4: {
                  queryKey: readonly ['test', 'prop', string, 'nested3', string | undefined, 'nested4'];
                };
              };
            };
          };
        };
      }>();
    });
  });
});
