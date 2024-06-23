import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Dynamode } from '@lib/module';
import { getTableAttributeDefinitions } from '@lib/table/helpers/definitions';
import * as attributeHelper from '@lib/table/helpers/utils';

import { TestTable, TestTableManager, TestTableMetadata } from '../../../fixtures';

describe('getTableAttributeDefinitions', () => {
  let getAttributeTypeSpy = vi.spyOn(attributeHelper, 'getAttributeType');
  let getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');

  beforeEach(() => {
    getAttributeTypeSpy = vi.spyOn(attributeHelper, 'getAttributeType');
    getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return AttributeDefinition array based on Partition Keys, Sort Keys and Indexes', async () => {
    getEntityAttributesSpy.mockReturnValue({
      partitionKeyName: {
        propertyName: 'partitionKey',
        type: String,
        role: 'partitionKey',
      },
      sortKeyName: {
        propertyName: 'sortKey',
        type: String,
        role: 'sortKey',
      },
      indexPartitionKeyName: {
        propertyName: 'indexPartitionKey',
        type: String,
        role: 'index',
        indexes: [{ name: 'indexName', role: 'gsiPartitionKey' }],
      },
    });

    getAttributeTypeSpy
      .mockReturnValueOnce('S')
      .mockReturnValueOnce('N')
      .mockReturnValueOnce('S')
      .mockReturnValueOnce('N');

    const metadata: TestTableMetadata = {
      ...TestTableManager.tableMetadata,
      indexes: {
        indexName: {
          partitionKey: 'indexPartitionKeyName',
          sortKey: 'indexSortKeyName',
        },
      } as any,
    };

    const expectedResult = [
      {
        AttributeName: 'partitionKey',
        AttributeType: 'S',
      },
      {
        AttributeName: 'sortKey',
        AttributeType: 'N',
      },
      {
        AttributeName: 'indexPartitionKeyName',
        AttributeType: 'S',
      },
      {
        AttributeName: 'indexSortKeyName',
        AttributeType: 'N',
      },
    ];

    const results = await getTableAttributeDefinitions(metadata as any, TestTable as any);

    expect(results).toEqual(expectedResult);
    expect(getEntityAttributesSpy).toHaveBeenCalledTimes(1);
    expect(getAttributeTypeSpy).toHaveBeenCalledTimes(4);
  });
});
