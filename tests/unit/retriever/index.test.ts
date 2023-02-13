import { beforeEach, describe, expect, test, vi } from 'vitest';

import * as entityHelpers from '@lib/entity/helpers';
import RetrieverBase from '@lib/retriever';
import { BASE_OPERATOR } from '@lib/utils';

import { MockEntity, TEST_TABLE_NAME, TestTableKeys } from '../../mocks';

describe('RetrieverBase', () => {
  let retriever = new RetrieverBase<TestTableKeys, typeof MockEntity>(MockEntity);

  beforeEach(() => {
    retriever = new RetrieverBase<TestTableKeys, typeof MockEntity>(MockEntity);
  });

  test('Should be able to initialize retriever', async () => {
    expect(retriever['operators']).toEqual([]);
    expect(retriever['entity']).toEqual(MockEntity);
    expect(retriever['logicalOperator']).toEqual(BASE_OPERATOR.and);
    expect(retriever['input']['TableName']).toEqual(TEST_TABLE_NAME);
    expect(retriever['attributeNames']).toEqual({});
    expect(retriever['attributeValues']).toEqual({});
  });

  describe('limit', () => {
    test('Should set Limit on query/scan input', async () => {
      retriever.limit(100);

      expect(retriever['input']['Limit']).toEqual(100);
    });
  });

  describe('startAt', () => {
    const convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(entityHelpers, 'convertPrimaryKeyToAttributeValues');
    convertPrimaryKeyToAttributeValuesSpy.mockImplementation(() => ({ partitionKey: { S: 'partitionKey' }, sortKey: { S: 'sortKey' } }));
    beforeEach(async () => convertPrimaryKeyToAttributeValuesSpy.mockReset);

    test('Should set ExclusiveStartKey on query/scan input', async () => {
      retriever.startAt({ partitionKey: 'partitionKey', sortKey: 'sortKey' });

      expect(retriever['input']['ExclusiveStartKey']).toEqual({ partitionKey: { S: 'partitionKey' }, sortKey: { S: 'sortKey' } });
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalledWith(MockEntity, { partitionKey: 'partitionKey', sortKey: 'sortKey' });
    });

    test('Should not set ExclusiveStartKey on query/scan input when undefined is passed', async () => {
      retriever.startAt(undefined);

      expect(retriever['input']['ExclusiveStartKey']).toEqual(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).not.toBeCalled();
    });
  });

  describe('consistent', () => {
    test('Should set ConsistentRead on query/scan input', async () => {
      retriever.consistent();

      expect(retriever['input']['ConsistentRead']).toEqual(true);
    });
  });

  describe('count', () => {
    test('Should set Select to "COUNT" on query/scan input', async () => {
      retriever.count();

      expect(retriever['input']['Select']).toEqual('COUNT');
    });
  });

  describe('attributes', () => {
    const buildProjectionExpressionSpy = vi.spyOn(entityHelpers, 'buildProjectionExpression');
    buildProjectionExpressionSpy.mockImplementation(() => 'mockedProjectionExpression');

    test('Should set ProjectionExpression on query/scan input', async () => {
      retriever.attributes(['partitionKey', 'array']);

      expect(buildProjectionExpressionSpy).toHaveBeenCalledWith(MockEntity, ['partitionKey', 'array'], {});
      expect(retriever['input']['ProjectionExpression']).toEqual('mockedProjectionExpression');
    });
  });
});
