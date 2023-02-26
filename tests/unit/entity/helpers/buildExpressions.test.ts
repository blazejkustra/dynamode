import { afterEach, describe, expect, test, vi } from 'vitest';

import Condition from '@lib/condition';
import {
  buildDeleteConditionExpression,
  buildGetProjectionExpression,
  buildPutConditionExpression,
  buildUpdateConditionExpression,
} from '@lib/entity/helpers/buildExpressions';
import * as buildOperators from '@lib/entity/helpers/buildOperators';
import { BASE_OPERATOR, DYNAMODE_ENTITY, OPERATORS, UPDATE_OPERATORS } from '@lib/utils';

import { MockEntity } from '../../../mocks';

const expressionBuilderRunSpy = vi.fn();

vi.mock('@lib/utils/ExpressionBuilder', () => {
  const ExpressionBuilder = vi.fn(() => ({
    attributeNames: { attributeNames: 'value' },
    attributeValues: { attributeValues: 'value' },
    run: expressionBuilderRunSpy,
  }));
  return { ExpressionBuilder };
});

describe('Build expressions entity helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildGetProjectionExpression', async () => {
    test('Should properly build projection expression with multiple attributes', async () => {
      const buildProjectionOperatorsSpy = vi.spyOn(buildOperators, 'buildProjectionOperators');
      buildProjectionOperatorsSpy.mockReturnValue([
        { key: 'set' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: 'string' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: DYNAMODE_ENTITY },
      ]);
      expressionBuilderRunSpy.mockReturnValue('set, string, dynamodeEntity');

      expect(buildGetProjectionExpression<typeof MockEntity>(['set', 'string'])).toEqual({
        projectionExpression: 'set, string, dynamodeEntity',
      });
      expect(buildProjectionOperatorsSpy).toBeCalledWith(['set', 'string']);
      expect(expressionBuilderRunSpy).toBeCalledWith([
        { key: 'set' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: 'string' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: DYNAMODE_ENTITY },
      ]);
    });

    test('Should properly build projection expression with multiple attributes and defined attributeNames', async () => {
      const buildProjectionOperatorsSpy = vi.spyOn(buildOperators, 'buildProjectionOperators');
      buildProjectionOperatorsSpy.mockReturnValue([
        { key: 'set' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: 'string' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: DYNAMODE_ENTITY },
      ]);
      expressionBuilderRunSpy.mockReturnValue('set, string, dynamodeEntity');

      expect(buildGetProjectionExpression<typeof MockEntity>(['set', 'string'], { test: 'test' })).toEqual({
        projectionExpression: 'set, string, dynamodeEntity',
        attributeNames: { test: 'test' },
      });
      expect(buildProjectionOperatorsSpy).toBeCalledWith(['set', 'string']);
      expect(expressionBuilderRunSpy).toBeCalledWith([
        { key: 'set' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: 'string' },
        BASE_OPERATOR.comma,
        BASE_OPERATOR.space,
        { key: DYNAMODE_ENTITY },
      ]);
    });

    test("Should return empty object if attributes doesn't exist or attributes are empty", async () => {
      expect(buildGetProjectionExpression<typeof MockEntity>()).toEqual({});
      expect(buildGetProjectionExpression<typeof MockEntity>([])).toEqual({});
    });

    test('Should return undefined projection expression if expression builder returns empty string', async () => {
      const buildProjectionOperatorsSpy = vi.spyOn(buildOperators, 'buildProjectionOperators');
      buildProjectionOperatorsSpy.mockReturnValue([]);
      expressionBuilderRunSpy.mockReturnValue('');

      expect(buildGetProjectionExpression<typeof MockEntity>(['array'])).toEqual({});
    });
  });

  describe('buildUpdateConditionExpression', async () => {
    test('Should properly build update expression', async () => {
      const buildUpdateOperatorsSpy = vi.spyOn(buildOperators, 'buildUpdateOperators');
      buildUpdateOperatorsSpy.mockReturnValue([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('string', 'value'),
      ]);
      expressionBuilderRunSpy.mockReturnValueOnce('SET string = value');

      expect(buildUpdateConditionExpression<typeof MockEntity>({ set: { string: 'value' } })).toEqual({
        updateExpression: 'SET string = value',
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
        conditionExpression: undefined,
      });

      expect(buildUpdateOperatorsSpy).toBeCalledWith({ set: { string: 'value' } });
      expect(expressionBuilderRunSpy).toBeCalledTimes(1);
      expect(expressionBuilderRunSpy).toBeCalledWith([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('string', 'value'),
      ]);
    });

    test('Should properly build update and condition expressions', async () => {
      const buildUpdateOperatorsSpy = vi.spyOn(buildOperators, 'buildUpdateOperators');
      buildUpdateOperatorsSpy.mockReturnValue([
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('string', 'value'),
      ]);
      expressionBuilderRunSpy.mockReturnValueOnce('SET string = value');
      expressionBuilderRunSpy.mockReturnValueOnce('string = value');

      expect(
        buildUpdateConditionExpression<typeof MockEntity>(
          { set: { string: 'value' } },
          new Condition(MockEntity).attribute('string').eq('value'),
        ),
      ).toEqual({
        updateExpression: 'SET string = value',
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
        conditionExpression: 'string = value',
      });

      expect(buildUpdateOperatorsSpy).toBeCalledWith({ set: { string: 'value' } });
      expect(expressionBuilderRunSpy).toBeCalledTimes(2);
      expect(expressionBuilderRunSpy).toHaveBeenNthCalledWith(1, [
        BASE_OPERATOR.set,
        BASE_OPERATOR.space,
        ...UPDATE_OPERATORS.set('string', 'value'),
      ]);
      expect(expressionBuilderRunSpy).toHaveBeenNthCalledWith(2, OPERATORS.eq('string', 'value'));
    });
  });

  describe('buildPutConditionExpression', async () => {
    test('Should properly build condition expression (first condition)', async () => {
      expressionBuilderRunSpy.mockReturnValue('string = value');

      expect(
        buildPutConditionExpression<typeof MockEntity>(new Condition(MockEntity).attribute('string').eq('value')),
      ).toEqual({
        conditionExpression: 'string = value',
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
      });

      expect(expressionBuilderRunSpy).toBeCalledWith(OPERATORS.eq('string', 'value'));
    });

    test('Should properly build condition expression (both conditions)', async () => {
      expressionBuilderRunSpy.mockReturnValue('string = value AND number = 1');

      expect(
        buildPutConditionExpression<typeof MockEntity>(
          new Condition(MockEntity).attribute('string').eq('value'),
          new Condition(MockEntity).attribute('number').eq(1),
        ),
      ).toEqual({
        conditionExpression: 'string = value AND number = 1',
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
      });

      expect(expressionBuilderRunSpy).toBeCalledWith([
        ...OPERATORS.eq('string', 'value'),
        BASE_OPERATOR.space,
        BASE_OPERATOR.and,
        BASE_OPERATOR.space,
        ...OPERATORS.eq('number', 1),
      ]);
      expect(expressionBuilderRunSpy).toBeCalledTimes(1);
    });

    test('Should properly build condition expression (second condition)', async () => {
      expressionBuilderRunSpy.mockReturnValue('number = 1');

      expect(
        buildPutConditionExpression<typeof MockEntity>(undefined, new Condition(MockEntity).attribute('number').eq(1)),
      ).toEqual({
        conditionExpression: 'number = 1',
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
      });

      expect(expressionBuilderRunSpy).toBeCalledWith(OPERATORS.eq('number', 1));
      expect(expressionBuilderRunSpy).toBeCalledTimes(1);
    });

    test('Should properly build condition expression (none conditions)', async () => {
      expressionBuilderRunSpy.mockReturnValue('');

      expect(buildPutConditionExpression<typeof MockEntity>(undefined, undefined)).toEqual({
        conditionExpression: undefined,
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
      });

      expect(expressionBuilderRunSpy).toBeCalledWith([]);
      expect(expressionBuilderRunSpy).toBeCalledTimes(1);
    });
  });

  describe('buildDeleteConditionExpression', async () => {
    test('Should properly build condition expression (first condition)', async () => {
      expressionBuilderRunSpy.mockReturnValue('string = value');

      expect(
        buildDeleteConditionExpression<typeof MockEntity>(new Condition(MockEntity).attribute('string').eq('value')),
      ).toEqual({
        conditionExpression: 'string = value',
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
      });

      expect(expressionBuilderRunSpy).toBeCalledWith(OPERATORS.eq('string', 'value'));
    });

    test('Should properly build condition expression (both conditions)', async () => {
      expressionBuilderRunSpy.mockReturnValue('string = value AND number = 1');

      expect(
        buildDeleteConditionExpression<typeof MockEntity>(
          new Condition(MockEntity).attribute('string').eq('value'),
          new Condition(MockEntity).attribute('number').eq(1),
        ),
      ).toEqual({
        conditionExpression: 'string = value AND number = 1',
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
      });

      expect(expressionBuilderRunSpy).toBeCalledWith([
        ...OPERATORS.eq('string', 'value'),
        BASE_OPERATOR.space,
        BASE_OPERATOR.and,
        BASE_OPERATOR.space,
        ...OPERATORS.eq('number', 1),
      ]);
      expect(expressionBuilderRunSpy).toBeCalledTimes(1);
    });

    test('Should properly build condition expression (second condition)', async () => {
      expressionBuilderRunSpy.mockReturnValue('number = 1');

      expect(
        buildDeleteConditionExpression<typeof MockEntity>(
          undefined,
          new Condition(MockEntity).attribute('number').eq(1),
        ),
      ).toEqual({
        conditionExpression: 'number = 1',
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
      });

      expect(expressionBuilderRunSpy).toBeCalledWith(OPERATORS.eq('number', 1));
      expect(expressionBuilderRunSpy).toBeCalledTimes(1);
    });

    test('Should properly build condition expression (none conditions)', async () => {
      expressionBuilderRunSpy.mockReturnValue('');

      expect(buildDeleteConditionExpression<typeof MockEntity>(undefined, undefined)).toEqual({
        conditionExpression: undefined,
        attributeNames: { attributeNames: 'value' },
        attributeValues: { attributeValues: 'value' },
      });

      expect(expressionBuilderRunSpy).toBeCalledWith([]);
      expect(expressionBuilderRunSpy).toBeCalledTimes(1);
    });
  });
});
