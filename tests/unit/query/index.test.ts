import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import * as entityHelpers from '@lib/entity/helpers';
import Query from '@lib/query';
import { BASE_OPERATOR } from '@lib/utils';
import * as utils from '@lib/utils/helpers';

import { MockEntity, MockEntityRegistry, mockInstance, TEST_TABLE_NAME, TestTableKeys } from '../../mocks';

vi.mock('@lib/utils/ExpressionBuilder', () => {
  const ExpressionBuilder = vi.fn(() => ({
    attributeNames: { attributeNames: 'value' },
    attributeValues: { attributeValues: 'value' },
    run: vi.fn().mockReturnValueOnce('keyConditionExpression').mockReturnValueOnce('filterExpression'),
  }));
  return { ExpressionBuilder };
});

describe('Query', () => {
  let query = MockEntityRegistry.query();
  let maybePushKeyLogicalOperatorSpy = vi.spyOn(query, 'maybePushKeyLogicalOperator' as any);
  let setAssociatedIndexNameSpy = vi.spyOn(query, 'setAssociatedIndexName' as any);

  beforeEach(() => {
    query = MockEntityRegistry.query();
    maybePushKeyLogicalOperatorSpy = vi.spyOn(query, 'maybePushKeyLogicalOperator' as any);
    setAssociatedIndexNameSpy = vi.spyOn(query, 'setAssociatedIndexName' as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should be able to initialize query', async () => {
    const query1 = MockEntityRegistry.query();
    expect(query1['operators']).toEqual([]);
    expect(query1['entity']).toEqual(MockEntity);
    expect(query1['logicalOperator']).toEqual(BASE_OPERATOR.and);
    expect(query1['keyOperators']).toEqual([]);

    const query2 = new Query<TestTableKeys, typeof MockEntity>(MockEntity);
    expect(query2['operators']).toEqual([]);
    expect(query2['entity']).toEqual(MockEntity);
    expect(query2['logicalOperator']).toEqual(BASE_OPERATOR.and);
    expect(query2['keyOperators']).toEqual([]);
  });

  describe('run', () => {
    const ddbQueryMock = vi.fn();

    let buildQueryInputSpy = vi.spyOn(query, 'buildQueryInput' as any);
    let validateQueryInputSpy = vi.spyOn(query, 'validateQueryInput' as any);
    let convertAttributeValuesToEntitySpy = vi.spyOn(entityHelpers, 'convertAttributeValuesToEntity');
    let convertAttributeValuesToPrimaryKeySpy = vi.spyOn(entityHelpers, 'convertAttributeValuesToPrimaryKey');
    let timeoutSpy = vi.spyOn(utils, 'timeout');

    const queryInput: QueryInput = {
      TableName: TEST_TABLE_NAME,
      KeyConditionExpression: 'partitionKey = :value',
      ExpressionAttributeValues: { ':value': { S: 'value' } },
    };

    beforeEach(() => {
      vi.spyOn(Dynamode.ddb, 'get').mockReturnValue({ query: ddbQueryMock } as any as DynamoDB);
      buildQueryInputSpy = vi.spyOn(query, 'buildQueryInput' as any).mockImplementation(() => (query['input'] = queryInput));
      validateQueryInputSpy = vi.spyOn(query, 'validateQueryInput' as any).mockReturnValue(undefined);
      convertAttributeValuesToEntitySpy = vi.spyOn(entityHelpers, 'convertAttributeValuesToEntity').mockReturnValue(mockInstance);
      convertAttributeValuesToPrimaryKeySpy = vi.spyOn(entityHelpers, 'convertAttributeValuesToPrimaryKey').mockReturnValue({ partitionKey: 'lastValue', sortKey: 'lastValue' } as any);
      timeoutSpy = vi.spyOn(utils, 'timeout').mockImplementation(async () => undefined);
    });

    test('Should build and validate query input', async () => {
      expect(query.run({ return: 'input' })).toEqual(queryInput);
      expect(buildQueryInputSpy).toBeCalled();
      expect(validateQueryInputSpy).toBeCalled();
    });

    test('Should build and validate query input with extraInput', async () => {
      query.run({ return: 'input', extraInput: { IndexName: 'indexName' } });
      expect(buildQueryInputSpy).toBeCalledWith({ IndexName: 'indexName' });
      expect(timeoutSpy).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
    });

    test('Should return query input for return = "input"', async () => {
      expect(query.run({ return: 'input' })).toEqual(queryInput);
      expect(timeoutSpy).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
    });

    test('Should return query output for return = "output"', async () => {
      ddbQueryMock.mockImplementation(() => {
        return { Items: 'test' };
      });

      await expect(query.run({ return: 'output' })).resolves.toEqual({ Items: 'test' });
      expect(timeoutSpy).not.toBeCalled();
      expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
      expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
    });

    describe('With option return = "default"', () => {
      test('Should return no items with no values returned', async () => {
        ddbQueryMock.mockImplementationOnce(() => {
          return { Items: [] };
        });

        await expect(query.run({ return: 'default' })).resolves.toEqual({
          items: [],
          lastKey: undefined,
          count: 0,
          scannedCount: 0,
        });

        expect(timeoutSpy).not.toBeCalled();
        expect(convertAttributeValuesToEntitySpy).not.toBeCalled();
        expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
      });

      test('Should return items with values returned', async () => {
        ddbQueryMock.mockImplementationOnce(() => {
          return { Items: [{ key: 'value' }], LastEvaluatedKey: { partitionKey: 'lastValue', sortKey: 'lastValue' }, Count: 1, ScannedCount: 100 };
        });
        convertAttributeValuesToEntitySpy.mockReturnValue(mockInstance);
        convertAttributeValuesToPrimaryKeySpy.mockReturnValue({ partitionKey: 'lastValue', sortKey: 'lastValue' } as any);

        await expect(query.run({ return: 'default' })).resolves.toEqual({
          items: [mockInstance],
          lastKey: { partitionKey: 'lastValue', sortKey: 'lastValue' },
          count: 1,
          scannedCount: 100,
        });

        expect(timeoutSpy).not.toBeCalled();
        expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(1);
        expect(convertAttributeValuesToEntitySpy).toBeCalledWith(MockEntity, { key: 'value' });
        expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledTimes(1);
        expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledWith(MockEntity, { partitionKey: 'lastValue', sortKey: 'lastValue' });
      });

      test('Should return items with "all: true" option', async () => {
        ddbQueryMock
          .mockImplementationOnce(() => {
            return { Items: [{ key: 'value1' }], LastEvaluatedKey: { key: 'value1' }, Count: 1, ScannedCount: 2 };
          })
          .mockImplementationOnce(() => {
            return { Items: [{ key: 'value2' }], LastEvaluatedKey: { key: 'value2' }, Count: 1, ScannedCount: 2 };
          })
          .mockImplementationOnce(() => {
            return { Items: [{ key: 'value3' }], Count: 1, ScannedCount: 1 };
          });

        convertAttributeValuesToEntitySpy.mockReturnValue(mockInstance);

        await expect(query.run({ all: true })).resolves.toEqual({
          items: [mockInstance, mockInstance, mockInstance],
          count: 3,
          scannedCount: 5,
        });

        expect(timeoutSpy).toBeCalledTimes(3);
        expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(3);
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, { key: 'value1' });
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, MockEntity, { key: 'value2' });
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(3, MockEntity, { key: 'value3' });
        expect(convertAttributeValuesToPrimaryKeySpy).not.toBeCalled();
      });

      test('Should return items with "all: true, max: 2, delay: 10" options', async () => {
        ddbQueryMock
          .mockImplementationOnce(() => {
            return { Items: [{ key: 'value1' }], LastEvaluatedKey: { key: 'value1' }, Count: 1, ScannedCount: 2 };
          })
          .mockImplementationOnce(() => {
            return { Items: [{ key: 'value2' }], LastEvaluatedKey: { key: 'value2' }, Count: 1, ScannedCount: 2 };
          });

        convertAttributeValuesToEntitySpy.mockReturnValue(mockInstance);
        convertAttributeValuesToPrimaryKeySpy.mockImplementation((entity, lastKey) => lastKey as any);

        await expect(query.run({ all: true, max: 2 })).resolves.toEqual({
          items: [mockInstance, mockInstance],
          lastKey: { key: 'value2' },
          count: 2,
          scannedCount: 4,
        });

        expect(timeoutSpy).toBeCalledTimes(2);
        expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(2);
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, MockEntity, { key: 'value1' });
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, MockEntity, { key: 'value2' });
        expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledTimes(1);
        expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledWith(MockEntity, { key: 'value2' });
      });
    });
  });

  describe('partitionKey', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call side effect methods', async () => {
      query.partitionKey('partitionKey');
      expect(maybePushKeyLogicalOperatorSpy).toBeCalled();
      expect(setAssociatedIndexNameSpy).toBeCalled();
    });

    describe('eq', () => {
      test('Should call eq method on keyOperators', async () => {
        const eqSpy = vi.spyOn(query, 'eq' as any);
        query.partitionKey('partitionKey').eq('value');
        expect(eqSpy).toBeCalledWith(query['keyOperators'], 'partitionKey', 'value');
      });
    });
  });

  describe('sortKey', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call side effect methods', async () => {
      query.sortKey('sortKey');
      expect(maybePushKeyLogicalOperatorSpy).toBeCalled();
      expect(setAssociatedIndexNameSpy).toBeCalled();
    });

    describe('eq', () => {
      test('Should call eq method on keyOperators', async () => {
        const eqSpy = vi.spyOn(query, 'eq' as any);
        query.sortKey('sortKey').eq('value');
        expect(eqSpy).toBeCalledWith(query['keyOperators'], 'sortKey', 'value');
      });
    });

    describe('ne', () => {
      test('Should call ne method on keyOperators', async () => {
        const neSpy = vi.spyOn(query, 'ne' as any);
        query.sortKey('sortKey').ne('value');
        expect(neSpy).toBeCalledWith(query['keyOperators'], 'sortKey', 'value');
      });
    });

    describe('lt', () => {
      test('Should call lt method on keyOperators', async () => {
        const ltSpy = vi.spyOn(query, 'lt' as any);
        query.sortKey('sortKey').lt('value');
        expect(ltSpy).toBeCalledWith(query['keyOperators'], 'sortKey', 'value');
      });
    });

    describe('le', () => {
      test('Should call le method on keyOperators', async () => {
        const leSpy = vi.spyOn(query, 'le' as any);
        query.sortKey('sortKey').le('value');
        expect(leSpy).toBeCalledWith(query['keyOperators'], 'sortKey', 'value');
      });
    });

    describe('gt', () => {
      test('Should call gt method on keyOperators', async () => {
        const gtSpy = vi.spyOn(query, 'gt' as any);
        query.sortKey('sortKey').gt('value');
        expect(gtSpy).toBeCalledWith(query['keyOperators'], 'sortKey', 'value');
      });
    });

    describe('ge', () => {
      test('Should call ge method on keyOperators', async () => {
        const geSpy = vi.spyOn(query, 'ge' as any);
        query.sortKey('sortKey').ge('value');
        expect(geSpy).toBeCalledWith(query['keyOperators'], 'sortKey', 'value');
      });
    });

    describe('beginsWith', () => {
      test('Should call beginsWith method on keyOperators', async () => {
        const beginsWithSpy = vi.spyOn(query, 'beginsWith' as any);
        query.sortKey('sortKey').beginsWith('value');
        expect(beginsWithSpy).toBeCalledWith(query['keyOperators'], 'sortKey', 'value');
      });
    });

    describe('between', () => {
      test('Should call between method on keyOperators', async () => {
        const betweenSpy = vi.spyOn(query, 'between' as any);
        query.sortKey('sortKey').between('value1', 'value2');
        expect(betweenSpy).toBeCalledWith(query['keyOperators'], 'sortKey', 'value1', 'value2');
      });
    });
  });

  describe('sort', () => {
    test('Should set ScanIndexForward on query input', async () => {
      query.sort('ascending');
      expect(query['input'].ScanIndexForward).toEqual(true);

      query.sort('descending');
      expect(query['input'].ScanIndexForward).toEqual(false);
    });
  });

  describe('maybePushKeyLogicalOperator', () => {
    test('Should push a logical operator if key operators are not empty', async () => {
      query['keyOperators'].push(BASE_OPERATOR.add);
      query['maybePushKeyLogicalOperator']();

      expect(query['keyOperators']).toEqual([BASE_OPERATOR.add, BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space]);
    });

    test('Should not push a logical operator if key operators are empty', async () => {
      query['maybePushKeyLogicalOperator']();

      expect(query['keyOperators']).toEqual([]);
    });
  });

  describe('setAssociatedIndexName', () => {
    const getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    test('Should set proper IndexName on query input for primary partitionKey', async () => {
      getEntityAttributesSpy.mockReturnValue({ partitionKey: {} });
      query['setAssociatedIndexName']('partitionKey');

      expect(query['input'].IndexName).toEqual(undefined);
    });

    test('Should set proper IndexName on query input for an attribute associated with index', async () => {
      getEntityAttributesSpy.mockReturnValue({ GSI_1_PK: { indexName: 'GSI_1_NAME' } });
      query['setAssociatedIndexName']('GSI_1_PK');

      expect(query['input'].IndexName).toEqual('GSI_1_NAME');
    });
  });

  describe('buildQueryInput', () => {
    test('Should successfully build query input without extraInput', async () => {
      query['buildQueryInput']();

      expect(query['input'].TableName).toEqual(TEST_TABLE_NAME);
      expect(query['input'].KeyConditionExpression).toEqual('keyConditionExpression');
      expect(query['input'].FilterExpression).toEqual('filterExpression');
      expect(query['input'].ExpressionAttributeNames).toEqual({
        attributeNames: 'value',
      });
      expect(query['input'].ExpressionAttributeValues).toEqual({
        attributeValues: 'value',
      });
    });

    test('Should successfully build query input with extraInput', async () => {
      query['buildQueryInput']({ IndexName: 'indexName', ExpressionAttributeValues: { attributeValues: { S: 'overriddenValue' } } });

      expect(query['input'].TableName).toEqual(TEST_TABLE_NAME);
      expect(query['input'].KeyConditionExpression).toEqual('keyConditionExpression');
      expect(query['input'].FilterExpression).toEqual('filterExpression');
      expect(query['input'].ExpressionAttributeNames).toEqual({
        attributeNames: 'value',
      });
      expect(query['input'].ExpressionAttributeValues).toEqual({ attributeValues: { S: 'overriddenValue' } });
      expect(query['input'].IndexName).toEqual('indexName');
    });
  });

  describe('validateQueryInput', () => {
    test.todo('Should successfully validate query input');
  });
});
