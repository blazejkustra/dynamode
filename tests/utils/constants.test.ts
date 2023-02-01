import { describe, expect, test } from 'vitest';

import { OPERATORS, RESERVED_WORDS } from '@lib/utils';

import { BASE_OPERATOR, UPDATE_OPERATORS } from './../../lib/utils/constants';

describe('Constants', () => {
  describe('RESERVED_WORDS', () => {
    test('Should return correct booleans depending if the key is in reserved words', async () => {
      expect(RESERVED_WORDS.has('WAIT')).toEqual(true);
      expect(RESERVED_WORDS.has('ALL')).toEqual(true);
      expect(RESERVED_WORDS.has('all')).toEqual(false);
      expect(RESERVED_WORDS.has('not_reserved_key')).toEqual(false);
    });
  });

  describe('OPERATORS', () => {
    test('parenthesis', async () => {
      expect(OPERATORS.parenthesis([])).toEqual([{ expression: '(' }, { expression: ')' }]);
      expect(OPERATORS.parenthesis([BASE_OPERATOR.and])).toEqual([{ expression: '(' }, { expression: 'AND' }, { expression: ')' }]);
    });

    test('eq', async () => {
      expect(OPERATORS.eq('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('ne', async () => {
      expect(OPERATORS.ne('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '<>' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('lt', async () => {
      expect(OPERATORS.lt('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '<' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('le', async () => {
      expect(OPERATORS.le('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '<=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('gt', async () => {
      expect(OPERATORS.gt('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '>' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('ge', async () => {
      expect(OPERATORS.ge('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '>=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('attributeExists', async () => {
      expect(OPERATORS.attributeExists('key')).toEqual([{ expression: 'attribute_exists' }, { expression: '(' }, { key: 'key' }, { expression: ')' }]);
    });

    test('contains', async () => {
      expect(OPERATORS.contains('key', 'value')).toEqual([{ expression: 'contains' }, { expression: '(' }, { key: 'key' }, { expression: ',' }, { expression: ' ' }, { value: 'value', key: 'key' }, { expression: ')' }]);
    });

    test('in', async () => {
      expect(OPERATORS.in('key', ['value1'])).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: 'IN' }, { expression: ' ' }, { value: 'value1', key: 'key' }]);
      expect(OPERATORS.in('key', ['value1', 'value2', 'value3'])).toEqual([
        { key: 'key' },
        { expression: ' ' },
        { expression: 'IN' },
        { expression: ' ' },
        { value: 'value1', key: 'key' },
        { expression: ',' },
        { expression: ' ' },
        { value: 'value2', key: 'key' },
        { expression: ',' },
        { expression: ' ' },
        { value: 'value3', key: 'key' },
      ]);
    });

    test('between', async () => {
      expect(OPERATORS.between('key', 'value1', 'value2')).toEqual([
        { key: 'key' },
        { expression: ' ' },
        { expression: 'BETWEEN' },
        { expression: ' ' },
        { value: 'value1', key: 'key' },
        { expression: ' ' },
        { expression: 'AND' },
        { expression: ' ' },
        { value: 'value2', key: 'key' },
      ]);
    });

    test('attributeType', async () => {
      expect(OPERATORS.attributeType('key', 'value')).toEqual([{ expression: 'attribute_type' }, { expression: '(' }, { key: 'key' }, { expression: ',' }, { expression: ' ' }, { value: 'value', key: 'key' }, { expression: ')' }]);
    });

    test('beginsWith', async () => {
      expect(OPERATORS.beginsWith('key', 'value')).toEqual([{ expression: 'begins_with' }, { expression: '(' }, { key: 'key' }, { expression: ',' }, { expression: ' ' }, { value: 'value', key: 'key' }, { expression: ')' }]);
    });

    test('attributeNotExists', async () => {
      expect(OPERATORS.attributeNotExists('key')).toEqual([{ expression: 'attribute_not_exists' }, { expression: '(' }, { key: 'key' }, { expression: ')' }]);
    });

    test('notContains', async () => {
      expect(OPERATORS.notContains('key', 'value')).toEqual([
        { expression: 'NOT' },
        { expression: ' ' },
        { expression: 'contains' },
        { expression: '(' },
        { key: 'key' },
        { expression: ',' },
        { expression: ' ' },
        { value: 'value', key: 'key' },
        { expression: ')' },
      ]);
    });

    test('notIn', async () => {
      expect(OPERATORS.notIn('key', ['value1'])).toEqual([
        { expression: 'NOT' },
        { expression: ' ' },
        { expression: '(' },
        { key: 'key' },
        { expression: ' ' },
        { expression: 'IN' },
        { expression: ' ' },
        { value: 'value1', key: 'key' },
        { expression: ')' },
      ]);
      expect(OPERATORS.notIn('key', ['value1', 'value2', 'value3'])).toEqual([
        { expression: 'NOT' },
        { expression: ' ' },
        { expression: '(' },
        { key: 'key' },
        { expression: ' ' },
        { expression: 'IN' },
        { expression: ' ' },
        { value: 'value1', key: 'key' },
        { expression: ',' },
        { expression: ' ' },
        { value: 'value2', key: 'key' },
        { expression: ',' },
        { expression: ' ' },
        { value: 'value3', key: 'key' },
        { expression: ')' },
      ]);
    });

    test('notEq', async () => {
      expect(OPERATORS.notEq('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '<>' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('notNe', async () => {
      expect(OPERATORS.notNe('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('notLt', async () => {
      expect(OPERATORS.notLt('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '>=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('notLe', async () => {
      expect(OPERATORS.notLe('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '>' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('notGt', async () => {
      expect(OPERATORS.notGt('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '<=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('notGe', async () => {
      expect(OPERATORS.notGe('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '<' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('sizeEq', async () => {
      expect(OPERATORS.sizeEq('key', 'value')).toEqual([{ expression: 'size' }, { expression: '(' }, { key: 'key' }, { expression: ')' }, { expression: ' ' }, { expression: '=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('sizeNe', async () => {
      expect(OPERATORS.sizeNe('key', 'value')).toEqual([{ expression: 'size' }, { expression: '(' }, { key: 'key' }, { expression: ')' }, { expression: ' ' }, { expression: '<>' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('sizeLt', async () => {
      expect(OPERATORS.sizeLt('key', 'value')).toEqual([{ expression: 'size' }, { expression: '(' }, { key: 'key' }, { expression: ')' }, { expression: ' ' }, { expression: '<' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('sizeLe', async () => {
      expect(OPERATORS.sizeLe('key', 'value')).toEqual([{ expression: 'size' }, { expression: '(' }, { key: 'key' }, { expression: ')' }, { expression: ' ' }, { expression: '<=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('sizeGt', async () => {
      expect(OPERATORS.sizeGt('key', 'value')).toEqual([{ expression: 'size' }, { expression: '(' }, { key: 'key' }, { expression: ')' }, { expression: ' ' }, { expression: '>' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('sizeGe', async () => {
      expect(OPERATORS.sizeGe('key', 'value')).toEqual([{ expression: 'size' }, { expression: '(' }, { key: 'key' }, { expression: ')' }, { expression: ' ' }, { expression: '>=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });
  });

  describe('UPDATE_OPERATORS', () => {
    test('set', async () => {
      expect(UPDATE_OPERATORS.set('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { expression: '=' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('setIfNotExists', async () => {
      expect(UPDATE_OPERATORS.setIfNotExists('key', 'value')).toEqual([
        { key: 'key' },
        { expression: ' ' },
        { expression: '=' },
        { expression: ' ' },
        { expression: 'if_not_exists' },
        { expression: '(' },
        { key: 'key' },
        { expression: ',' },
        { expression: ' ' },
        { value: 'value', key: 'key' },
        { expression: ')' },
      ]);
    });

    test('listAppend', async () => {
      expect(UPDATE_OPERATORS.listAppend('key', 'value')).toEqual([
        { key: 'key' },
        { expression: ' ' },
        { expression: '=' },
        { expression: ' ' },
        { expression: 'list_append' },
        { expression: '(' },
        { key: 'key' },
        { expression: ',' },
        { expression: ' ' },
        { value: 'value', key: 'key' },
        { expression: ')' },
      ]);
    });

    test('increment', async () => {
      expect(UPDATE_OPERATORS.increment('key', 'value')).toEqual([
        { key: 'key' },
        { expression: ' ' },
        { expression: '=' },
        { expression: ' ' },
        { key: 'key' },
        { expression: ' ' },
        { expression: '+' },
        { expression: ' ' },
        { value: 'value', key: 'key' },
      ]);
    });

    test('decrement', async () => {
      expect(UPDATE_OPERATORS.decrement('key', 'value')).toEqual([
        { key: 'key' },
        { expression: ' ' },
        { expression: '=' },
        { expression: ' ' },
        { key: 'key' },
        { expression: ' ' },
        { expression: '-' },
        { expression: ' ' },
        { value: 'value', key: 'key' },
      ]);
    });

    test('add', async () => {
      expect(UPDATE_OPERATORS.add('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('delete', async () => {
      expect(UPDATE_OPERATORS.delete('key', 'value')).toEqual([{ key: 'key' }, { expression: ' ' }, { value: 'value', key: 'key' }]);
    });

    test('remove', async () => {
      expect(UPDATE_OPERATORS.remove('key')).toEqual([{ key: 'key' }]);
    });
  });
});
