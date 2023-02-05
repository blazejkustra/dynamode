import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { QueryInput } from '@aws-sdk/client-dynamodb';
import { gsiPartitionKey, gsiSortKey, lsiSortKey, primaryPartitionKey } from '@lib/decorators';
import { Dynamode } from '@lib/dynamode';
import Entity from '@lib/entity';
import Query from '@lib/query';
import { BASE_OPERATOR } from '@lib/utils';
import * as utils from '@lib/utils/helpers';

const ddbQueryMock = vi.fn();

//TODO: FIX this and instead use tests/mocks.ts
//ts-ignore
class MockEntity extends Entity<{
  partitionKey: 'key';
  indexes: { GSI: { partitionKey: 'gsiPartitionKey'; sortKey: 'gsiSortKey' }; LSI: { sortKey: 'lsiSortKey' } };
}>('tableName') {
  static ddb = { query: ddbQueryMock } as any;

  @primaryPartitionKey(String)
  key: string;

  @gsiPartitionKey(String, 'GSI')
  gsiPartitionKey: string;

  @gsiSortKey(String, 'GSI')
  gsiSortKey: string;

  @lsiSortKey(String, 'LSI')
  lsiSortKey: string;
}

vi.mock('@lib/utils/ExpressionBuilder', () => {
  const ExpressionBuilder = vi.fn(() => ({
    attributeNames: { attributeNames: 'value' },
    attributeValues: { attributeValues: 'value' },
    run: vi.fn().mockReturnValueOnce('keyConditionExpression').mockReturnValueOnce('filterExpression'),
  }));
  return { ExpressionBuilder };
});

describe('Query', () => {
  test('Should be able to initialize retriever', async () => {
    const query1 = MockEntity.query();
    expect(query1['operators']).toEqual([]);
    expect(query1['entity']).toEqual(MockEntity);
    expect(query1['logicalOperator']).toEqual(BASE_OPERATOR.and);
    expect(query1['keyOperators']).toEqual([]);

    // FIX this
    const query2 = new Query(MockEntity as any);
    expect(query2['operators']).toEqual([]);
    expect(query2['entity']).toEqual(MockEntity);
    expect(query2['logicalOperator']).toEqual(BASE_OPERATOR.and);
    expect(query2['keyOperators']).toEqual([]);
  });

  describe('partitionKey', () => {
    const query = MockEntity.query();
    const maybePushKeyLogicalOperatorSpy = vi.spyOn(query, 'maybePushKeyLogicalOperator' as any);
    const setAssociatedIndexNameSpy = vi.spyOn(query, 'setAssociatedIndexName' as any);

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call side effect methods', async () => {
      query.partitionKey('key');
      expect(maybePushKeyLogicalOperatorSpy).toBeCalled();
      expect(setAssociatedIndexNameSpy).toBeCalled();
    });

    describe('eq', () => {
      const eqSpy = vi.spyOn(query, 'eq' as any);

      test('Should call eq method on keyOperators', async () => {
        query.partitionKey('key').eq('value');
        expect(eqSpy).toBeCalledWith(query['keyOperators'], 'key', 'value');
      });
    });
  });

  describe('sortKey', () => {
    const query = MockEntity.query();
    const maybePushKeyLogicalOperatorSpy = vi.spyOn(query, 'maybePushKeyLogicalOperator' as any);
    const setAssociatedIndexNameSpy = vi.spyOn(query, 'setAssociatedIndexName' as any);

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call side effect methods', async () => {
      query.sortKey('key');
      expect(maybePushKeyLogicalOperatorSpy).toBeCalled();
      expect(setAssociatedIndexNameSpy).toBeCalled();
    });

    describe('eq', () => {
      const eqSpy = vi.spyOn(query, 'eq' as any);

      test('Should call eq method on keyOperators', async () => {
        query.sortKey('key').eq('value');
        expect(eqSpy).toBeCalledWith(query['keyOperators'], 'key', 'value');
      });
    });

    describe('ne', () => {
      const neSpy = vi.spyOn(query, 'ne' as any);

      test('Should call ne method on keyOperators', async () => {
        query.sortKey('key').ne('value');
        expect(neSpy).toBeCalledWith(query['keyOperators'], 'key', 'value');
      });
    });

    describe('lt', () => {
      const ltSpy = vi.spyOn(query, 'lt' as any);

      test('Should call lt method on keyOperators', async () => {
        query.sortKey('key').lt('value');
        expect(ltSpy).toBeCalledWith(query['keyOperators'], 'key', 'value');
      });
    });

    describe('le', () => {
      const leSpy = vi.spyOn(query, 'le' as any);

      test('Should call le method on keyOperators', async () => {
        query.sortKey('key').le('value');
        expect(leSpy).toBeCalledWith(query['keyOperators'], 'key', 'value');
      });
    });

    describe('gt', () => {
      const gtSpy = vi.spyOn(query, 'gt' as any);

      test('Should call gt method on keyOperators', async () => {
        query.sortKey('key').gt('value');
        expect(gtSpy).toBeCalledWith(query['keyOperators'], 'key', 'value');
      });
    });

    describe('ge', () => {
      const geSpy = vi.spyOn(query, 'ge' as any);

      test('Should call ge method on keyOperators', async () => {
        query.sortKey('key').ge('value');
        expect(geSpy).toBeCalledWith(query['keyOperators'], 'key', 'value');
      });
    });

    describe('beginsWith', () => {
      const beginsWithSpy = vi.spyOn(query, 'beginsWith' as any);

      test('Should call beginsWith method on keyOperators', async () => {
        query.sortKey('key').beginsWith('value');
        expect(beginsWithSpy).toBeCalledWith(query['keyOperators'], 'key', 'value');
      });
    });

    describe('between', () => {
      const betweenSpy = vi.spyOn(query, 'between' as any);

      test('Should call between method on keyOperators', async () => {
        query.sortKey('key').between('value1', 'value2');
        expect(betweenSpy).toBeCalledWith(query['keyOperators'], 'key', 'value1', 'value2');
      });
    });
  });

  describe('sort', () => {
    test('Should set ScanIndexForward on query input', async () => {
      const query = MockEntity.query();
      query.sort('ascending');
      expect(query['input']['ScanIndexForward']).toEqual(true);

      query.sort('descending');
      expect(query['input']['ScanIndexForward']).toEqual(false);
    });
  });

  describe('run', () => {
    let query = MockEntity.query();
    let buildQueryInputSpy = vi.spyOn(query, 'buildQueryInput' as any);
    let validateQueryInputSpy = vi.spyOn(query, 'validateQueryInput' as any);
    let convertAttributeValuesToEntitySpy = vi.spyOn(MockEntity, 'convertAttributeValuesToEntity');
    let convertAttributeValuesToPrimaryKeySpy = vi.spyOn(MockEntity, 'convertAttributeValuesToPrimaryKey');
    let timeoutSpy = vi.spyOn(utils, 'timeout');

    const mockEntityInstance = new MockEntity();

    const queryInput: QueryInput = {
      TableName: 'tableName',
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: { '#key': 'key' },
      ExpressionAttributeValues: { ':value': { S: 'value' } },
    };

    beforeEach(() => {
      query = MockEntity.query();
      buildQueryInputSpy = vi.spyOn(query, 'buildQueryInput' as any).mockImplementation(() => (query['input'] = queryInput));
      validateQueryInputSpy = vi.spyOn(query, 'validateQueryInput' as any).mockReturnValue(undefined);
      convertAttributeValuesToEntitySpy = vi.spyOn(MockEntity, 'convertAttributeValuesToEntity').mockReturnValue(mockEntityInstance);
      convertAttributeValuesToPrimaryKeySpy = vi.spyOn(MockEntity, 'convertAttributeValuesToPrimaryKey').mockReturnValue({ key: 'lastValue' });
      timeoutSpy = vi.spyOn(utils, 'timeout').mockImplementation(async () => undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
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
          return { Items: [{ key: 'value' }], LastEvaluatedKey: { key: 'lastValue' }, Count: 1, ScannedCount: 100 };
        });
        convertAttributeValuesToEntitySpy.mockReturnValue(mockEntityInstance);
        convertAttributeValuesToPrimaryKeySpy.mockReturnValue({ key: 'lastValue' });

        await expect(query.run({ return: 'default' })).resolves.toEqual({
          items: [mockEntityInstance],
          lastKey: { key: 'lastValue' },
          count: 1,
          scannedCount: 100,
        });

        expect(timeoutSpy).not.toBeCalled();
        expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(1);
        expect(convertAttributeValuesToEntitySpy).toBeCalledWith({ key: 'value' });
        expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledTimes(1);
        expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledWith({ key: 'lastValue' });
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

        convertAttributeValuesToEntitySpy.mockReturnValue(mockEntityInstance);

        await expect(query.run({ all: true })).resolves.toEqual({
          items: [mockEntityInstance, mockEntityInstance, mockEntityInstance],
          count: 3,
          scannedCount: 5,
        });

        expect(timeoutSpy).toBeCalledTimes(3);
        expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(3);
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, { key: 'value1' });
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, { key: 'value2' });
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(3, { key: 'value3' });
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

        convertAttributeValuesToEntitySpy.mockReturnValue(mockEntityInstance);
        convertAttributeValuesToPrimaryKeySpy.mockImplementation((lastKey) => lastKey);

        await expect(query.run({ all: true, max: 2 })).resolves.toEqual({
          items: [mockEntityInstance, mockEntityInstance],
          lastKey: { key: 'value2' },
          count: 2,
          scannedCount: 4,
        });

        expect(timeoutSpy).toBeCalledTimes(2);
        expect(convertAttributeValuesToEntitySpy).toBeCalledTimes(2);
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(1, { key: 'value1' });
        expect(convertAttributeValuesToEntitySpy).toHaveBeenNthCalledWith(2, { key: 'value2' });
        expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledTimes(1);
        expect(convertAttributeValuesToPrimaryKeySpy).toBeCalledWith({ key: 'value2' });
      });
    });
  });

  describe('buildQueryInput', () => {
    test('Should successfully build query input without extraInput', async () => {
      const query = MockEntity.query();
      query['buildQueryInput']();

      expect(query['input']['TableName']).toEqual('tableName');
      expect(query['input']['KeyConditionExpression']).toEqual('keyConditionExpression');
      expect(query['input']['FilterExpression']).toEqual('filterExpression');
      expect(query['input']['ExpressionAttributeNames']).toEqual({
        attributeNames: 'value',
      });
      expect(query['input']['ExpressionAttributeValues']).toEqual({
        attributeValues: 'value',
      });
    });

    test('Should successfully build query input with extraInput', async () => {
      const query = MockEntity.query();
      query['buildQueryInput']({ IndexName: 'indexName', ExpressionAttributeValues: { attributeValues: { S: 'overriddenValue' } } });

      expect(query['input']['TableName']).toEqual('tableName');
      expect(query['input']['KeyConditionExpression']).toEqual('keyConditionExpression');
      expect(query['input']['FilterExpression']).toEqual('filterExpression');
      expect(query['input']['ExpressionAttributeNames']).toEqual({
        attributeNames: 'value',
      });
      expect(query['input']['ExpressionAttributeValues']).toEqual({ attributeValues: { S: 'overriddenValue' } });
      expect(query['input']['IndexName']).toEqual('indexName');
    });
  });

  describe('validateQueryInput', () => {
    test.todo('Should successfully validate query input');
  });

  describe('maybePushKeyLogicalOperator', () => {
    test('Should push a logical operator if key operators are not empty', async () => {
      const query = MockEntity.query();
      query['keyOperators'].push(BASE_OPERATOR.add);
      query['maybePushKeyLogicalOperator']();

      expect(query['keyOperators']).toEqual([BASE_OPERATOR.add, BASE_OPERATOR.space, BASE_OPERATOR.and, BASE_OPERATOR.space]);
    });

    test('Should not push a logical operator if key operators are empty', async () => {
      const query = MockEntity.query();
      query['maybePushKeyLogicalOperator']();

      expect(query['keyOperators']).toEqual([]);
    });
  });

  describe('setAssociatedIndexName', () => {
    const getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes' as any);

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    test('Should set proper IndexName on query input for primary partitionKey', async () => {
      const query = MockEntity.query();
      getEntityAttributesSpy.mockReturnValue({ key: {} });
      query['setAssociatedIndexName']('key');

      expect(query['input']['IndexName']).toEqual(undefined);
    });

    test('Should set proper IndexName on query input for an attribute associated with index', async () => {
      const query = MockEntity.query();
      getEntityAttributesSpy.mockReturnValue({ gsiPartitionKey: { indexName: 'indexName' } });
      query['setAssociatedIndexName']('gsiPartitionKey');

      expect(query['input']['IndexName']).toEqual('indexName');
    });
  });
});
