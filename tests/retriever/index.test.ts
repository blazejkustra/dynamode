import { beforeEach, describe, expect, test, vi } from 'vitest';

import { primaryPartitionKey } from '@lib/decorators';
import Entity from '@lib/entity';
import * as entityHelpers from '@lib/entity/helpers';
import RetrieverBase from '@lib/retriever';
import { BASE_OPERATOR } from '@lib/utils';

//TODO: FIX this and instead use tests/mocks.ts
class MockEntity extends Entity<{ partitionKey: 'key' }>('tableName') {
  @primaryPartitionKey(String)
  key: string;
}

describe('RetrieverBase', () => {
  test('Should be able to initialize retriever', async () => {
    const retriever = new RetrieverBase(MockEntity as any);
    expect(retriever['operators']).toEqual([]);
    expect(retriever['entity']).toEqual(MockEntity);
    expect(retriever['logicalOperator']).toEqual(BASE_OPERATOR.and);
    expect(retriever['input']['TableName']).toEqual('tableName');
    expect(retriever['attributeNames']).toEqual({});
    expect(retriever['attributeValues']).toEqual({});
  });

  describe('limit', () => {
    test('Should set Limit on query/scan input', async () => {
      const retriever = new RetrieverBase(MockEntity as any);
      retriever.limit(100);

      expect(retriever['input']['Limit']).toEqual(100);
    });
  });

  describe('startAt', () => {
    const convertPrimaryKeyToAttributeValuesSpy = vi.spyOn(MockEntity, 'convertPrimaryKeyToAttributeValues');
    beforeEach(async () => convertPrimaryKeyToAttributeValuesSpy.mockReset);

    test('Should set ExclusiveStartKey on query/scan input', async () => {
      const retriever = new RetrieverBase(MockEntity as any);
      retriever.startAt({ key: 'partitionKey' });

      expect(retriever['input']['ExclusiveStartKey']).toEqual({ key: { S: 'partitionKey' } });
      expect(convertPrimaryKeyToAttributeValuesSpy).toBeCalled();
    });

    test('Should not set ExclusiveStartKey on query/scan input when undefined is passed', async () => {
      const retriever = new RetrieverBase(MockEntity as any);
      retriever.startAt(undefined);

      expect(retriever['input']['ExclusiveStartKey']).toEqual(undefined);
      expect(convertPrimaryKeyToAttributeValuesSpy).not.toBeCalled();
    });
  });

  describe('consistent', () => {
    test('Should set ConsistentRead on query/scan input', async () => {
      const retriever = new RetrieverBase(MockEntity as any);
      retriever.consistent();

      expect(retriever['input']['ConsistentRead']).toEqual(true);
    });
  });

  describe('count', () => {
    test('Should set Select to "COUNT" on query/scan input', async () => {
      const retriever = new RetrieverBase(MockEntity as any);
      retriever.count();

      expect(retriever['input']['Select']).toEqual('COUNT');
    });
  });

  describe('attributes', () => {
    const buildProjectionExpressionSpy = vi.spyOn(entityHelpers, 'buildProjectionExpression');
    buildProjectionExpressionSpy.mockImplementation(() => 'mockedProjectionExpression');

    test('Should set ProjectionExpression on query/scan input', async () => {
      const retriever = new RetrieverBase(MockEntity as any);
      retriever.attributes(['key', 'array']);

      expect(buildProjectionExpressionSpy).toHaveBeenCalledWith(['key', 'array'], {});
      expect(retriever['input']['ProjectionExpression']).toEqual('mockedProjectionExpression');
    });
  });
});
