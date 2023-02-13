import { describe, expect, test, vi } from 'vitest';

import { AttributeNames, AttributeValues, BASE_OPERATOR, ExpressionBuilder, OPERATORS, Operators } from '@lib/utils';

vi.mock('@lib/utils/converter', () => ({
  valueToDynamo: (value: unknown) => value,
}));

describe('ExpressionBuilder', () => {
  describe('constructor', () => {
    test('Should init attributeNames and attributeValues', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.attributeNames).toEqual(undefined);
      expect(expressionBuilder.attributeValues).toEqual(undefined);
    });

    test('Should use passed attributeNames and attributeValues in constructor', async () => {
      const attributeNames: AttributeNames = { '#key': 'key' };
      const attributeValues: AttributeValues = { ':key': { S: 'value' } };
      const expressionBuilder = new ExpressionBuilder({ attributeNames, attributeValues });

      expect(expressionBuilder.attributeNames).toEqual({ '#key': 'key' });
      expect(attributeNames).toEqual({ '#key': 'key' });
      expect(expressionBuilder.attributeNames).toStrictEqual(attributeNames);

      expect(expressionBuilder.attributeValues).toEqual({ ':key': { S: 'value' } });
      expect(attributeValues).toEqual({ ':key': { S: 'value' } });
      expect(expressionBuilder.attributeValues).toStrictEqual(attributeValues);
    });
  });

  describe('substituteName', () => {
    test('Should substitute name for reserved word', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteName('absolute')).toEqual('#absolute');
      expect(expressionBuilder.attributeNames).toEqual({ '#absolute': 'absolute' });
    });

    test('Should not substitute name for non reserved word', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteName('nonReserved')).toEqual('nonReserved');
      expect(expressionBuilder.attributeNames).toEqual(undefined);
    });

    test('Should substitute name for reserved word (nested keys)', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteName('absolute.ATOMIC.nonReserved')).toEqual('#absolute.#ATOMIC.nonReserved');
      expect(expressionBuilder.attributeNames).toEqual({ '#absolute': 'absolute', '#ATOMIC': 'ATOMIC' });
    });

    test('Should substitute name for reserved word (nested keys with array)', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteName('absolute[1].ATOMIC[123][0].nonReserved[0]')).toEqual('#absolute[1].#ATOMIC[123][0].nonReserved[0]');
      expect(expressionBuilder.attributeNames).toEqual({ '#absolute': 'absolute', '#ATOMIC': 'ATOMIC' });
    });
  });

  describe('substituteValue', () => {
    test('Should add attribute to attributeMap without suffix', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteValue('key', 'value')).toEqual(':key');
      expect(expressionBuilder.attributeValues).toEqual({ ':key': 'value' });
    });

    test('Should add attribute to attributeMap with suffix', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteValue('key', 'value')).toEqual(':key');
      expect(expressionBuilder.substituteValue('key', 'anotherValue')).toEqual(':key__1');
      expect(expressionBuilder.attributeValues).toEqual({ ':key': 'value', ':key__1': 'anotherValue' });
    });

    test('Should work for nested attributes', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteValue('key.key.key', 'value')).toEqual(':key_key_key');
      expect(expressionBuilder.attributeValues).toEqual({ ':key_key_key': 'value' });
    });

    test('Should work for nested attributes with suffix', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteValue('key.key.key', 'value')).toEqual(':key_key_key');
      expect(expressionBuilder.substituteValue('key.key.key', 'anotherValue')).toEqual(':key_key_key__1');
      expect(expressionBuilder.attributeValues).toEqual({ ':key_key_key': 'value', ':key_key_key__1': 'anotherValue' });
    });

    test('Should work for nested attributes with suffix and nested arrays', async () => {
      const expressionBuilder = new ExpressionBuilder();
      expect(expressionBuilder.substituteValue('key[0].key[1][2].key[3]', 'value')).toEqual(':key_index0_key_index1_index2_key_index3');
      expect(expressionBuilder.substituteValue('key[0].key[1][2].key[3]', 'anotherValue')).toEqual(':key_index0_key_index1_index2_key_index3__1');
      expect(expressionBuilder.attributeValues).toEqual({
        ':key_index0_key_index1_index2_key_index3': 'value',
        ':key_index0_key_index1_index2_key_index3__1': 'anotherValue',
      });
    });
  });

  describe('run', () => {
    test('Should return empty string with no operators', async () => {
      const expressionBuilder = new ExpressionBuilder();
      const operators: Operators = [];

      expect(expressionBuilder.run(operators)).toEqual('');
      expect(expressionBuilder.attributeNames).toEqual(undefined);
      expect(expressionBuilder.attributeValues).toEqual(undefined);
    });

    test('Should connect strings with no keys and values', async () => {
      const expressionBuilder = new ExpressionBuilder();
      const operators: Operators = [{ expression: 'one' }, BASE_OPERATOR.space, { expression: 'two' }, BASE_OPERATOR.space, { expression: 'three' }];

      expect(expressionBuilder.run(operators)).toEqual('one two three');
      expect(expressionBuilder.attributeNames).toEqual(undefined);
      expect(expressionBuilder.attributeValues).toEqual(undefined);
    });

    test('Should connect strings with custom keys and values', async () => {
      const expressionBuilder = new ExpressionBuilder();
      const operators: Operators = [
        ...OPERATORS.parenthesis([...OPERATORS.eq('key', 'value'), BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space, ...OPERATORS.contains('array', 1)]),
        BASE_OPERATOR.space,
        BASE_OPERATOR.or,
        BASE_OPERATOR.space,
        ...OPERATORS.attributeExists('key.key1.list[0].key.ATOMIC'),
        BASE_OPERATOR.space,
        BASE_OPERATOR.or,
        BASE_OPERATOR.space,
        ...OPERATORS.sizeLe('key', 100),
      ];

      expect(expressionBuilder.run(operators)).toEqual('(#key = :key AND contains(#array, :array)) OR attribute_exists(#key.key1.#list[0].#key.#ATOMIC) OR size(#key) <= :key__1');
      expect(expressionBuilder.attributeNames).toEqual({ '#key': 'key', '#array': 'array', '#list': 'list', '#ATOMIC': 'ATOMIC' });
      expect(expressionBuilder.attributeValues).toEqual({ ':key': 'value', ':array': 1, ':key__1': 100 });
    });

    test('Should throw an error if value key is out of range', async () => {
      const expressionBuilder = new ExpressionBuilder();
      const operators: Operators = Array(1001).fill({ key: 'key', value: 'value' });

      expect(() => expressionBuilder.run(operators)).toThrowError();
    });
  });
});
