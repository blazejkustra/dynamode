import { afterEach, describe, expect, test, vi } from 'vitest';

import { buildProjectionOperators, buildUpdateOperators } from '@lib/entity/helpers/buildOperators';
import { BASE_OPERATOR, DefaultError, DYNAMODE_ENTITY, UPDATE_OPERATORS } from '@lib/utils';

import { MockEntity } from '../../../mocks';

import { ExpressionBuilder } from './../../../../lib/utils/ExpressionBuilder';

describe('Build operators entity helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildProjectionOperators', async () => {
    test('Should properly build projection operators with multiple attributes', async () => {
      expect(buildProjectionOperators<typeof MockEntity>(['set', 'string', 'object.optional'])).toEqual([
        { key: 'set' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: 'string' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: 'object.optional' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: DYNAMODE_ENTITY },
      ]);
    });

    test('Should properly build projection operators with one attribute', async () => {
      expect(buildProjectionOperators<typeof MockEntity>(['set'])).toEqual([
        { key: 'set' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: DYNAMODE_ENTITY },
      ]);
    });

    test('Should properly build projection operators with zero attributes', async () => {
      expect(buildProjectionOperators<typeof MockEntity>([])).toEqual([{ key: DYNAMODE_ENTITY }]);
    });

    test('Should throw an error for duplicates', async () => {
      expect(() => buildProjectionOperators<typeof MockEntity>(['set', 'set'])).toThrow(DefaultError);
    });
  });

  describe('buildUpdateOperators', async () => {
    test('Should properly build update operators with props.set', async () => {
      expect(buildUpdateOperators<typeof MockEntity>({ set: { string: 'value', number: 1 } })).toEqual([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('string', 'value'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('number', 1),
      ]);
    });

    test('Should properly build update operators with props.setIfNotExists', async () => {
      expect(buildUpdateOperators<typeof MockEntity>({ setIfNotExists: { string: 'value', number: 1 } })).toEqual([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.setIfNotExists('string', 'value'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.setIfNotExists('number', 1),
      ]);
    });

    test('Should properly build update operators with props.listAppend', async () => {
      expect(buildUpdateOperators<typeof MockEntity>({ listAppend: { array: ['1'] } })).toEqual([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.listAppend('array', ['1']),
      ]);
    });

    test('Should properly build update operators with props.increment', async () => {
      expect(buildUpdateOperators<typeof MockEntity>({ increment: { number: 1, 'object.required': 2 } })).toEqual([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.increment('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.increment('object.required', 2),
      ]);
    });

    test('Should properly build update operators with props.decrement', async () => {
      expect(buildUpdateOperators<typeof MockEntity>({ decrement: { number: 1, 'object.required': 2 } })).toEqual([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.decrement('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.decrement('object.required', 2),
      ]);
    });

    test('Should properly build update operators with props.add', async () => {
      expect(
        buildUpdateOperators<typeof MockEntity>({ add: { number: 1, 'object.required': 2, set: new Set('1') } }),
      ).toEqual([
        BASE_OPERATOR.add,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('object.required', 2),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('set', new Set('1')),
      ]);
    });

    test('Should properly build update operators with props.delete', async () => {
      expect(buildUpdateOperators<typeof MockEntity>({ delete: { set: new Set('1') } })).toEqual([
        BASE_OPERATOR.delete,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.delete('set', new Set('1')),
      ]);
    });

    test('Should properly build update operators with props.remove', async () => {
      expect(buildUpdateOperators<typeof MockEntity>({ remove: ['array', 'boolean'] })).toEqual([
        BASE_OPERATOR.remove,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.remove('array'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.remove('boolean'),
      ]);
    });

    test('Should properly build update operators with multiple props', async () => {
      expect(
        buildUpdateOperators<typeof MockEntity>({
          set: { string: 'value', number: 1 },
          setIfNotExists: { string: 'value', number: 1 },
          listAppend: { array: ['1'] },
          increment: { number: 1, 'object.required': 2 },
          decrement: { number: 1, 'object.required': 2 },
          add: { number: 1, 'object.required': 2, set: new Set('1') },
          delete: { set: new Set('1') },
          remove: ['array', 'boolean'],
        }),
      ).toEqual([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('string', 'value'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.setIfNotExists('string', 'value'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.setIfNotExists('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.listAppend('array', ['1']),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.increment('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.increment('object.required', 2),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.decrement('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.decrement('object.required', 2),

        BASE_OPERATOR.space,

        BASE_OPERATOR.add,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('object.required', 2),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('set', new Set('1')),

        BASE_OPERATOR.space,

        BASE_OPERATOR.delete,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.delete('set', new Set('1')),

        BASE_OPERATOR.space,

        BASE_OPERATOR.remove,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.remove('array'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.remove('boolean'),
      ]);

      console.log(
        ` new ExpressionBuilder().run([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('string', 'value'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.setIfNotExists('string', 'value'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.setIfNotExists('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.listAppend('array', ['1']),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.increment('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.increment('object.required', 2),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.decrement('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.decrement('object.required', 2),

        BASE_OPERATOR.space,

        BASE_OPERATOR.add,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('number', 1),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('object.required', 2),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.add('set', new Set('1')),

        BASE_OPERATOR.space,

        BASE_OPERATOR.delete,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.delete('set', new Set('1')),

        BASE_OPERATOR.space,

        BASE_OPERATOR.remove,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.remove('array'),
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.remove('boolean'),
      ]); = `,
        new ExpressionBuilder().run([
          BASE_OPERATOR.set,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.set('string', 'value'),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.set('number', 1),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.setIfNotExists('string', 'value'),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.setIfNotExists('number', 1),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.listAppend('array', ['1']),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.increment('number', 1),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.increment('object.required', 2),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.decrement('number', 1),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.decrement('object.required', 2),

          BASE_OPERATOR.space,

          BASE_OPERATOR.add,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.add('number', 1),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.add('object.required', 2),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.add('set', new Set('1')),

          BASE_OPERATOR.space,

          BASE_OPERATOR.delete,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.delete('set', new Set('1')),

          BASE_OPERATOR.space,

          BASE_OPERATOR.remove,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.remove('array'),
          BASE_OPERATOR.comma,
          BASE_OPERATOR.space,
          ...UPDATE_OPERATORS.remove('boolean'),
        ]),
      );
    });

    test('Should properly build update operators with no props', async () => {
      expect(buildUpdateOperators<typeof MockEntity>({} as any)).toEqual([]);
    });
  });
});